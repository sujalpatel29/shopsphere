import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { EmptyCart } from "../../components/cart/EmptyCart";
import { CartItemSkeleton } from "../../components/cart/CartItemSkeleton";
import { ArrowRight } from "lucide-react";
import api from "../../../api/api";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi"
];

function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [applyingOffer, setApplyingOffer] = useState(false);
  const [offerCode, setOfferCode] = useState("");
  const [applicableOffers, setApplicableOffers] = useState([]);
  const toast = useRef(null);
  
  // Address states
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    type: "home"
  });
  
  // Available offers display
  const [showOffers, setShowOffers] = useState(false);

  const formatINR = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      // Backend returns { success, message, data: { cartId, items, subtotal, ... } }
      setCart(response.data.data);
      
      // Fetch applicable offers
      const offersRes = await api.get("/cart/offers");
      // Backend returns { success, message, data: { cartOffers: [...], productOffers: [...] } }
      const offersData = offersRes.data.data || {};
      // Combine cart and product offers, adding type field for filtering
      const cartOffersWithType = (offersData.cartOffers || []).map(o => ({ ...o, type: 'cart' }));
      const productOffersWithType = (offersData.productOffers || []).map(o => ({ ...o, type: 'product' }));
      setApplicableOffers([...cartOffersWithType, ...productOffersWithType]);
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status !== 401) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load cart",
          life: 3000,
        });
      }
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCart();
    } else {
      setLoading(false);
      setCart(null);
    }
  }, [currentUser]);

  // Update item quantity
  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(cartItemId);
    
    try {
      const response = await api.patch(`/cart/items/${cartItemId}`, { quantity: newQuantity });
      setCart(response.data.data);
      toast.current?.show({
        severity: "success",
        summary: "Updated",
        detail: "Quantity updated successfully",
        life: 2000,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to update quantity",
        life: 3000,
      });
    } finally {
      setUpdatingItem(null);
    }
  };

  // Remove item from cart
  const removeItem = (cartItemId, productName) => {
    confirmDialog({
      message: `Are you sure you want to remove "${productName}" from your cart?`,
      header: "Remove Item",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const response = await api.delete(`/cart/items/${cartItemId}`);
          setCart(response.data.data);
          toast.current?.show({
            severity: "success",
            summary: "Removed",
            detail: "Item removed from cart",
            life: 2000,
          });
        } catch (error) {
          console.error("Error removing item:", error);
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: error.response?.data?.message || "Failed to remove item",
            life: 3000,
          });
        }
      },
    });
  };

  // Apply cart-level offer
  const applyOffer = async () => {
    if (!offerCode.trim()) return;
    
    setApplyingOffer(true);
    
    try {
      // Find offer by code from applicable offers
      const offer = applicableOffers.find(o => 
        o.offer_name?.toLowerCase() === offerCode.toLowerCase() || 
        o.offer_id?.toString() === offerCode
      );
      
      if (!offer) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid Code",
          detail: "This offer code is not valid or not applicable to your cart",
          life: 3000,
        });
        setApplyingOffer(false);
        return;
      }

      // Check if it's a product offer or cart offer
      if (offer.type === 'product') {
        // Find the cart item for this product
        const cartItem = cart.items.find(item => item.productId === offer.product_id);
        if (!cartItem) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Product not found in cart",
            life: 3000,
          });
          setApplyingOffer(false);
          return;
        }
        
        // Apply product-specific offer
        const response = await api.post(`/cart/items/${cartItem.cartItemId}/offer`, { offer_id: offer.offer_id });
        setCart(response.data.data);
        toast.current?.show({
          severity: "success",
          summary: "Offer Applied!",
          detail: `${offer.offer_name} applied to ${cartItem.productName}`,
          life: 3000,
        });
      } else {
        // Apply cart-level offer
        const response = await api.post("/cart/offer", { offer_id: offer.offer_id });
        setCart(response.data.data);
        toast.current?.show({
          severity: "success",
          summary: "Offer Applied!",
          detail: `${offer.offer_name} applied successfully`,
          life: 3000,
        });
      }
      
      setOfferCode("");
    } catch (error) {
      console.error("Error applying offer:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to apply offer",
        life: 3000,
      });
    } finally {
      setApplyingOffer(false);
    }
  };

  // Apply product-specific offer to a cart item
  const applyProductOffer = async (offer) => {
    if (!cart) return;
    
    // Find the cart item for this product
    const cartItem = cart.items.find(item => item.productId === offer.product_id);
    if (!cartItem) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Product not found in cart",
        life: 3000,
      });
      return;
    }

    // Check if item already has an offer applied
    if (cartItem.appliedOffer) {
      toast.current?.show({
        severity: "warning",
        summary: "Offer Already Applied",
        detail: "This product already has an offer. Remove it first to apply a new one.",
        life: 3000,
      });
      return;
    }

    try {
      const response = await api.post(`/cart/items/${cartItem.cartItemId}/offer`, { offer_id: offer.offer_id });
      setCart(response.data.data);
      toast.current?.show({
        severity: "success",
        summary: "Offer Applied!",
        detail: `${offer.offer_name} applied to ${cartItem.productName}`,
        life: 3000,
      });
    } catch (error) {
      console.error("Error applying product offer:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to apply offer",
        life: 3000,
      });
    }
  };

  // Remove offer from a cart item
  const removeItemOffer = async (cartItemId, offerName) => {
    try {
      const response = await api.delete(`/cart/items/${cartItemId}/offer`);
      setCart(response.data.data);
      toast.current?.show({
        severity: "success",
        summary: "Removed",
        detail: `${offerName} removed from product`,
        life: 2000,
      });
    } catch (error) {
      console.error("Error removing item offer:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to remove offer",
        life: 3000,
      });
    }
  };

  // Remove applied offer
  const removeOffer = async () => {
    try {
      const response = await api.delete("/cart/offer");
      setCart(response.data.data);
      toast.current?.show({
        severity: "success",
        summary: "Removed",
        detail: "Offer removed from cart",
        life: 2000,
      });
    } catch (error) {
      console.error("Error removing offer:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to remove offer",
        life: 3000,
      });
    }
  };

  // Calculate savings from item discounts
  const calculateSavings = () => {
    if (!cart) return 0;
    return cart.items?.reduce((total, item) => {
      if (item.appliedOffer?.discount_amount) {
        return total + item.appliedOffer.discount_amount;
      }
      return total;
    }, 0) || 0;
  };

  // Proceed to checkout - create order from cart
  const proceedToCheckout = async () => {
    if (!currentUser) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    
    if (!cart?.items?.length) {
      toast.current?.show({
        severity: "warning",
        summary: "Empty Cart",
        detail: "Please add items to your cart first",
        life: 3000,
      });
      return;
    }

    try {
      setApplyingOffer(true);
      // Create order from cart using existing backend endpoint
      const response = await api.post("/orders/make-order");
      
      toast.current?.show({
        severity: "success",
        summary: "Order Placed!",
        detail: `Your order #${response.data?.order?.order_number || ''} has been placed successfully. Our team will process it shortly.`,
        life: 5000,
      });
      
      // Clear cart after successful order
      setCart({ items: [], subtotal: 0, total: 0 });
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.current?.show({
        severity: "error",
        summary: "Order Failed",
        detail: error.response?.data?.message || "Failed to place order. Please try again.",
        life: 3000,
      });
    } finally {
      setApplyingOffer(false);
    }
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/");
  };

  // Handle address form input changes
  const handleAddressFormChange = (field, value) => {
    setAddressForm(prev => ({ ...prev, [field]: value }));
  };

  // Save new address
  const saveNewAddress = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.current?.show({
        severity: "error",
        summary: "Incomplete",
        detail: "Please fill all required fields",
        life: 3000,
      });
      return;
    }
    
    const newAddress = {
      id: Date.now(),
      ...addressForm,
      isDefault: false
    };
    
    setSelectedAddress(newAddress);
    setShowAddressForm(false);
    setAddressForm({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      type: "home"
    });
    
    toast.current?.show({
      severity: "success",
      summary: "Address Saved",
      detail: "New delivery address added",
      life: 2000,
    });
  };

  // Get product-specific offers for items in cart
  const getAvailableProductOffers = () => {
    if (!cart || !applicableOffers.length) return [];
    
    // Get offers that are type='product' and match products in cart
    return applicableOffers.filter(offer => {
      if (offer.type !== "product") return false;
      
      // Find the cart item this offer applies to
      const matchingItem = cart.items.find(item => item.productId === offer.product_id);
      
      // Only show if:
      // 1. The product is in the cart
      // 2. The offer doesn't already have an applied offer on that item
      return matchingItem && !matchingItem.appliedOffer;
    });
  };

  // Get cart-level offers
  const getCartOffers = () => {
    if (!applicableOffers.length) return [];
    return applicableOffers.filter(offer => offer.type === "cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff8ee] dark:bg-[#0b151b] pt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton width="200px" height="40px" className="bg-gray-200 dark:bg-[#243440]" />
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
            <div className="lg:col-span-1">
              <Skeleton height="400px" borderRadius="16px" className="bg-gray-200 dark:bg-[#243440]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen bg-[#fff8ee] dark:bg-[#0b151b] pt-20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <EmptyCart onContinueShopping={continueShopping} />
        </div>
      </div>
    );
  }

  const savings = calculateSavings();
  const hasOffer = cart.appliedCartOffer;

  return (
    <div className="min-h-screen bg-[#fff8ee] dark:bg-[#0b151b] pt-20">
      <Toast ref={toast} position="top-right" />
      <ConfirmDialog 
        className="cart-confirm-dialog"
        contentClassName="dark:bg-[#151e22]"
        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
      />
      
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex mb-4 text-sm text-gray-500 dark:text-slate-400">
            <Link to="/" className="hover:text-[#2f7a6f] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-slate-100">Shopping Cart</span>
          </nav>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 dark:text-slate-100">
            Shopping Cart ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
          </h1>
        </div>

        {/* Mobile Order Summary Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#151e22] border-t border-[#e8dccf] dark:border-[#243440] p-4 z-40 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">Total Amount</p>
              <p className="text-xl font-bold text-gray-900 dark:text-slate-100">₹{formatINR(cart.total)}</p>
            </div>
            <Button
              label={
                <span className="flex items-center gap-2">
                  <span>{currentUser ? "Checkout" : "Login"}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </span>
              }
              onClick={proceedToCheckout}
              className="!px-6 !py-3 !bg-[#2f7a6f] !text-white !rounded-xl hover:!bg-[#265c54] !transition-all"
              pt={{
                root: { className: "!overflow-hidden" },
                label: { className: "!p-0 !m-0" },
              }}
            />
          </div>
          {cart.discount > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 text-center">
              You're saving ₹{formatINR(cart.discount)} on this order
            </p>
          )}
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3 pb-32 lg:pb-0">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.cartItemId}
                className="group bg-white dark:bg-[#151e22] rounded-2xl p-4 md:p-6 shadow-sm border border-[#e8dccf] dark:border-[#243440] transition-all hover:shadow-md"
              >
                <div className="flex gap-4 md:gap-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a262f]">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <i className="pi pi-image text-2xl" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-slate-100 text-base sm:text-lg line-clamp-2">
                          {item.productName}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {item.shortDescription}
                        </p>
                        
                        {/* Portion & Modifier Details */}
                        {(item.portionId || item.modifierId) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.portionValue && (
                              <Tag 
                                value={item.portionValue} 
                                severity="info"
                                className="text-xs"
                              />
                            )}
                            {item.modifierName && (
                              <Tag 
                                value={item.modifierName} 
                                severity="secondary"
                                className="text-xs"
                              />
                            )}
                          </div>
                        )}
                        
                        {/* Applied Offer on Item */}
                        {item.appliedOffer && (
                          <div className="mt-2 flex items-center gap-2">
                            <Tag 
                              value={`${item.appliedOffer.offer_name} (-₹${item.appliedOffer.discount_amount})`} 
                              severity="success"
                              className="text-xs"
                            />
                            <button
                              onClick={() => removeItemOffer(item.cartItemId, item.appliedOffer.offer_name)}
                              className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                            >
                              <i className="pi pi-times" />
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right sm:text-right">
                        <p className="font-semibold text-gray-900 dark:text-slate-100 text-base sm:text-lg">
                          ₹{formatINR(item.lineTotal)}
                        </p>
                        {item.appliedOffer && (
                          <p className="text-xs sm:text-sm text-gray-400 line-through">
                            ₹{formatINR(item.lineTotal + item.appliedOffer.discount_amount)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-[#243440]">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">Qty:</span>
                        <div className="flex items-center border border-[#2f7a6f] rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItem === item.cartItemId}
                            className="px-2 sm:px-3 py-1 text-[#2f7a6f] hover:bg-[#2f7a6f]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <i className="pi pi-minus text-xs sm:text-sm" />
                          </button>
                          <span className="px-2 sm:px-3 py-1 text-gray-900 dark:text-slate-100 font-medium min-w-[36px] sm:min-w-[40px] text-center text-sm sm:text-base">
                            {updatingItem === item.cartItemId ? (
                              <i className="pi pi-spinner pi-spin" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                            disabled={updatingItem === item.cartItemId}
                            className="px-2 sm:px-3 py-1 text-[#2f7a6f] hover:bg-[#2f7a6f]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <i className="pi pi-plus text-xs sm:text-sm" />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.cartItemId, item.productName)}
                        className="text-red-500 hover:text-red-600 text-xs sm:text-sm flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <i className="pi pi-trash text-sm" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <button
              onClick={continueShopping}
              className="flex items-center gap-2 text-[#2f7a6f] hover:text-[#265c54] font-medium transition-colors"
            >
              <i className="pi pi-arrow-left" />
              Continue Shopping
            </button>
            
            {/* Delivery Address Section */}
            <div className="mt-8 bg-white dark:bg-[#151e22] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#e8dccf] dark:border-[#243440]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100">
                  <i className="pi pi-map-marker text-[#2f7a6f] mr-2" />
                  Delivery Address
                </h2>
                <Button
                  label="Add New"
                  icon="pi pi-plus"
                  className="p-button-text p-button-sm text-[#2f7a6f] text-xs sm:text-sm"
                  onClick={() => setShowAddressForm(true)}
                />
              </div>
              
              {selectedAddress ? (
                <div className="p-3 sm:p-4 border-2 border-[#2f7a6f] rounded-xl bg-[#2f7a6f]/5">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-slate-100 text-sm sm:text-base">{selectedAddress.name}</span>
                        <Tag value={selectedAddress.type === "home" ? "Home" : "Work"} severity="info" className="text-xs" />
                        {selectedAddress.isDefault && <Tag value="Default" severity="success" className="text-xs" />}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400">{selectedAddress.phone}</p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-1">
                        {selectedAddress.address}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                      </p>
                    </div>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <Button
                        icon="pi pi-pencil"
                        className="p-button-text p-button-sm text-gray-500"
                        onClick={() => {
                          setAddressForm(selectedAddress);
                          setShowAddressForm(true);
                        }}
                      />
                      {DUMMY_ADDRESSES.length > 1 && (
                        <Dropdown
                          value={selectedAddress.id}
                          options={DUMMY_ADDRESSES.map(a => ({ label: `${a.type.toUpperCase()} - ${a.city}`, value: a.id }))}
                          onChange={(e) => {
                            const addr = DUMMY_ADDRESSES.find(a => a.id === e.value);
                            if (addr) setSelectedAddress(addr);
                          }}
                          className="p-inputtext-sm text-xs dark:bg-[#1a262f] dark:border-[#243440]"
                          panelClassName="dark:bg-[#1a262f]"
                          placeholder="Change"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10 sm:py-12 rounded-xl border border-dashed border-[#e8dccf] dark:border-[#243440] bg-[#fff8ee]/30 dark:bg-[#0f171c]/30">
                  <i className="pi pi-map-marker text-4xl text-gray-300 dark:text-slate-600 mb-4" />
                  <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">
                    No delivery address selected
                  </p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs mt-1 mb-5">
                    Add an address to place your order.
                  </p>
                  <Button
                    label="Add Address"
                    icon="pi pi-plus"
                    className="p-button-sm !bg-[#2f7a6f] !border-none !text-white !rounded-xl hover:!bg-[#265c54] !transition-colors"
                    onClick={() => setShowAddressForm(true)}
                  />
                </div>
              )}
            </div>
            
            {/* Available Offers Section */}
            <div className="mt-6 bg-white dark:bg-[#151e22] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#e8dccf] dark:border-[#243440]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100">
                  <i className="pi pi-tags text-amber-600 mr-2" />
                  Available Offers
                </h2>
                <Button
                  label={showOffers ? "Hide" : "Show All"}
                  icon={showOffers ? "pi pi-chevron-up" : "pi pi-chevron-down"}
                  className="p-button-text p-button-sm text-[#2f7a6f] text-xs sm:text-sm"
                  onClick={() => setShowOffers(!showOffers)}
                />
              </div>
              
              {/* Product Offers */}
              {getAvailableProductOffers().length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Product Offers</p>
                  <div className="space-y-2">
                    {getAvailableProductOffers().map((offer) => {
                      // Find the product this offer applies to
                      const productItem = cart.items.find(item => item.productId === offer.product_id);
                      const isApplied = productItem?.appliedOffer?.offer_id === offer.offer_id;
                      
                      return (
                        <div 
                          key={offer.offer_id} 
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            isApplied 
                              ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30'
                              : 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`pi ${isApplied ? 'pi-check-circle text-green-600' : 'pi-tag text-amber-600'}`} />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{offer.offer_name}</p>
                              <p className="text-xs text-gray-500 dark:text-slate-400">
                                {productItem?.productName && (
                                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                                    on {productItem.productName}
                                  </span>
                                )}
                                {offer.description && ` • ${offer.description}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Tag 
                              value={offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`} 
                              severity={isApplied ? "success" : "warning"} 
                            />
                            {!isApplied && (
                              <Button
                                label="Apply"
                                size="small"
                                onClick={() => applyProductOffer(offer)}
                                className="!bg-amber-600 !border-amber-600 hover:!bg-amber-700 !text-white !text-xs !px-2 !py-1"
                              />
                            )}
                            {isApplied && (
                              <Tag value="Applied" severity="success" icon="pi pi-check" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Cart Offers */}
              {showOffers && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cart Offers</p>
                  <div className="space-y-2">
                    {getCartOffers().length > 0 ? (
                      getCartOffers().map((offer) => {
                        const isApplicable = cart.subtotal >= (offer.min_purchase_amount || 0);
                        const isApplied = cart.appliedCartOffer?.offer_id === offer.offer_id;
                        
                        return (
                          <div 
                            key={offer.offer_id} 
                            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                              isApplied 
                                ? 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30' 
                                : isApplicable
                                  ? 'bg-gray-50 dark:bg-[#1a262f] border border-gray-200 dark:border-[#243440]'
                                  : 'bg-gray-100 dark:bg-[#1a262f]/50 opacity-60 border border-gray-200 dark:border-[#243440]'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <i className={`pi ${isApplied ? 'pi-check-circle text-green-600' : isApplicable ? 'pi-ticket text-[#2f7a6f]' : 'pi-lock text-gray-400'}`} />
                              <div>
                                <p className={`text-sm font-medium ${isApplicable ? 'text-gray-900 dark:text-slate-100' : 'text-gray-500 dark:text-slate-400'}`}>{offer.offer_name}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">{offer.description}</p>
                                {!isApplicable && offer.min_purchase_amount && (
                                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                    Min. order ₹{formatINR(offer.min_purchase_amount)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag 
                                value={offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `₹${offer.discount_value} OFF`} 
                                severity={isApplied ? "success" : isApplicable ? "info" : "secondary"} 
                              />
                              {isApplicable && !isApplied && !cart.appliedCartOffer && (
                                <Button
                                  label="Apply"
                                  size="small"
                                  onClick={() => {
                                    setOfferCode(offer.offer_name);
                                    applyOffer();
                                  }}
                                  className="!bg-[#2f7a6f] !border-[#2f7a6f] hover:!bg-[#236b62] !text-white !text-xs !px-2 !py-1"
                                />
                              )}
                              {isApplied && (
                                <Tag value="Applied" severity="success" icon="pi pi-check" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                        No cart offers available
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#151e22] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#e8dccf] dark:border-[#243440] lg:sticky top-24">
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4 sm:mb-6">
                Order Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 text-sm border-b border-gray-100 dark:border-[#243440] pb-4 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-slate-400">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{formatINR(cart.subtotal)}</span>
                </div>
                
                {cart.tax > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-slate-400">
                    <span>Tax (GST)</span>
                    <span>₹{formatINR(cart.tax)}</span>
                  </div>
                )}
                
                {cart.itemDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Item Discounts</span>
                    <span>-₹{formatINR(cart.itemDiscount)}</span>
                  </div>
                )}
                
                {cart.cartDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Cart Discount</span>
                    <span>-₹{formatINR(cart.cartDiscount)}</span>
                  </div>
                )}

                {cart.discount > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-slate-400">
                    <span>Total Discount</span>
                    <span className="text-green-600 dark:text-green-400">-₹{formatINR(cart.discount)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex items-baseline justify-between gap-4 mb-6">
                <span className="text-base font-semibold text-gray-900 dark:text-slate-100">Total</span>
                <span className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                  ₹{formatINR(cart.total)}
                </span>
              </div>

              {/* Checkout Button - Hidden on mobile */}
              <Button
                label={
                  <span className="relative flex w-full items-center justify-center pr-10">
                    <span>{currentUser ? "Proceed to Checkout" : "Login to Checkout"}</span>
                    <span className="absolute right-4">
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  </span>
                }
                onClick={proceedToCheckout}
                className="!w-full !py-3 !bg-[#2f7a6f] !border-none !text-white !rounded-xl hover:!bg-[#265c54] !transition-all !shadow-lg !shadow-[#2f7a6f]/20 hidden lg:!flex"
                pt={{
                  root: { className: "!overflow-hidden" },
                  label: { className: "!p-0 !m-0 !w-full" },
                }}
              />
              
              {/* Mobile Checkout Button */}
              <div className="lg:hidden">
                <p className="text-center text-sm text-gray-500 dark:text-slate-400 mb-2">
                  Review your order and proceed
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-gray-500 dark:text-slate-400">
                <div className="p-2">
                  <i className="pi pi-shield text-[#2f7a6f] text-lg mb-1" />
                  <p>Secure Payment</p>
                </div>
                <div className="p-2">
                  <i className="pi pi-refresh text-[#2f7a6f] text-lg mb-1" />
                  <p>Easy Returns</p>
                </div>
                <div className="p-2">
                  <i className="pi pi-truck text-[#2f7a6f] text-lg mb-1" />
                  <p>Fast Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Form Dialog */}
      <Dialog
        header="Add Delivery Address"
        visible={showAddressForm}
        style={{ width: '90%', maxWidth: '500px' }}
        className="dark:bg-[#151e22]"
        contentClassName="dark:bg-[#151e22]"
        headerClassName="dark:bg-[#151e22] dark:text-slate-100"
        onHide={() => setShowAddressForm(false)}
        footer={
          <div className="flex gap-2 justify-end dark:bg-[#151e22]">
            <Button label="Cancel" className="p-button-text dark:text-slate-300" onClick={() => setShowAddressForm(false)} />
            <Button label="Save Address" className="bg-[#2f7a6f] text-white border-none" onClick={saveNewAddress} />
          </div>
        }
      >
        <div className="space-y-4 p-4 dark:bg-[#151e22]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Full Name *</label>
              <InputText
                value={addressForm.name}
                onChange={(e) => handleAddressFormChange('name', e.target.value)}
                placeholder="Enter full name"
                className="w-full dark:bg-[#1a262f] dark:border-[#243440] dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Phone Number *</label>
              <InputText
                value={addressForm.phone}
                onChange={(e) => handleAddressFormChange('phone', e.target.value)}
                placeholder="+91 00000 00000"
                className="w-full dark:bg-[#1a262f] dark:border-[#243440] dark:text-slate-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Street Address *</label>
            <InputText
              value={addressForm.address}
              onChange={(e) => handleAddressFormChange('address', e.target.value)}
              placeholder="House/Flat No., Street, Area"
              className="w-full dark:bg-[#1a262f] dark:border-[#243440] dark:text-slate-100"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">City *</label>
              <InputText
                value={addressForm.city}
                onChange={(e) => handleAddressFormChange('city', e.target.value)}
                placeholder="City"
                className="w-full dark:bg-[#1a262f] dark:border-[#243440] dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Pincode *</label>
              <InputText
                value={addressForm.pincode}
                onChange={(e) => handleAddressFormChange('pincode', e.target.value)}
                placeholder="000000"
                className="w-full dark:bg-[#1a262f] dark:border-[#243440] dark:text-slate-100"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">State *</label>
            <Dropdown
              value={addressForm.state}
              options={INDIAN_STATES.map(s => ({ label: s, value: s }))}
              onChange={(e) => handleAddressFormChange('state', e.value)}
              placeholder="Select State"
              className="w-full dark:bg-[#1a262f] dark:border-[#243440]"
              panelClassName="dark:bg-[#1a262f]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Address Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="home"
                  checked={addressForm.type === "home"}
                  onChange={() => handleAddressFormChange('type', 'home')}
                  className="accent-[#2f7a6f] w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  <i className="pi pi-home mr-1" /> Home
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addressType"
                  value="work"
                  checked={addressForm.type === "work"}
                  onChange={() => handleAddressFormChange('type', 'work')}
                  className="accent-[#2f7a6f] w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">
                  <i className="pi pi-building mr-1" /> Work
                </span>
              </label>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default CartPage;
