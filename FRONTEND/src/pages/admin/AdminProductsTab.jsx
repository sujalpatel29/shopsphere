/**
 * @component AdminProductsTab
 * @description Orchestrator for the Products management tab.
 *
 * Owns all product-related state (data, pagination, search, filters, modals)
 * and delegates rendering to child components:
 *  - AdminProductsToolbar  → search input, status filter, "New Product" button
 *  - AdminProductsTable    → PrimeReact lazy DataTable with sorting & pagination
 *  - ProductFormModal      → Create/Edit dialog with 4 tabs (Info, Portions, Modifiers, Images)
 *  - ProductDeleteDialog   → Confirmation dialog for safe deletion
 *
 * Data flow: Server-side pagination via adminProductsApi → loadProducts()
 * Pattern:   Optimistic UI updates for status toggles; pessimistic for CRUD.
 *
 * API: adminProductsApi (fetchAdminProducts, createAdminProduct, updateAdminProduct,
 *      updateProductStatus, deleteAdminProduct)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Toast } from "primereact/toast";
import AdminProductsToolbar from "./AdminProductsToolbar";
import AdminProductsTable from "./AdminProductsTable";
import ProductFormModal from "./ProductFormModal";
import ProductDeleteDialog from "./ProductDeleteDialog";
import {
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  updateProductStatus,
  deleteAdminProduct,
} from "../../../api/adminProductsApi";
import "./AdminProducts.css";

/**
 * AdminProductsTab - Main orchestrator component for product management
 * Manages state for pagination, search, filtering, and product data
 */
function AdminProductsTab() {
  const toast = useRef(null);

  // Product data state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalActive, setTotalActive] = useState(0);

  // Lazy loading parameters
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: "",
  });

  // Status filter state
  const [statusFilter, setStatusFilter] = useState(null);

  // Modal states
  const [productModal, setProductModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialTab, setInitialTab] = useState(0);

  // Operation states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Show toast notification
  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  }, []);

  // Extract error message from API error
  const getErrorMessage = (error) => {
    return (
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred. Please try again."
    );
  };

  // Fetch products from API
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, total, totalAll: fetchedAll, totalActive: fetchedActive } = await fetchAdminProducts({
        page: lazyParams.page,
        limit: lazyParams.rows,
        search: lazyParams.search,
        sortField: lazyParams.sortField,
        sortOrder: lazyParams.sortOrder,
        isActive: statusFilter,
      });
      setProducts(data);
      setTotalRecords(total);
      setTotalAll(fetchedAll);
      setTotalActive(fetchedActive);
    } catch (error) {
      console.error("Failed to load products:", error);
      showToast("error", "Error", getErrorMessage(error));
      setProducts([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [lazyParams, statusFilter, showToast]);

  // Load products on mount and when parameters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle lazy loading events (pagination, sorting)
  const handleLazyLoad = useCallback((params) => {
    setLazyParams((prev) => ({
      ...prev,
      ...params,
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback((searchValue) => {
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 1,
      search: searchValue,
    }));
  }, []);

  // Handle status filter change
  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 1,
    }));
  }, []);

  // Handle opening add product modal
  const handleAddProduct = useCallback(() => {
    setSelectedProduct(null);
    setInitialTab(0);
    setProductModal(true);
  }, []);

  // Handle opening edit product modal
  const handleEditProduct = useCallback((product) => {
    setSelectedProduct(product);
    setInitialTab(0);
    setProductModal(true);
  }, []);

  // Handle closing product modal — refresh list so image/portion/modifier changes are visible
  const handleCloseProductModal = useCallback(() => {
    setProductModal(false);
    setSelectedProduct(null);
    loadProducts();
  }, [loadProducts]);

  // Handle saving product (create or update)
  const handleSaveProduct = useCallback(
    async (formData) => {
      setSaving(true);
      try {
        if (selectedProduct) {
          // Update existing product
          await updateAdminProduct(selectedProduct.product_id, formData);
          showToast("success", "Success", "Product updated successfully");
          // Refresh data maintaining current page
          await loadProducts();
          handleCloseProductModal();
        } else {
          // Create new product
          const result = await createAdminProduct(formData);
          const newProductId = result?.data?.product_id;
          showToast(
            "success",
            "Success",
            "Product created! You can now add portions and modifiers."
          );
          // Transition modal to edit mode with the new product
          setSelectedProduct({
            product_id: newProductId,
            ...formData,
          });
          // Refresh list in background to show new product
          setLazyParams((prev) => ({
            ...prev,
            first: 0,
            page: 1,
          }));
        }
      } catch (error) {
        console.error("Failed to save product:", error);
        showToast("error", "Error", getErrorMessage(error));
      } finally {
        setSaving(false);
      }
    },
    [selectedProduct, loadProducts, handleCloseProductModal, showToast]
  );

  // Handle opening delete confirmation dialog
  const handleDeleteClick = useCallback((product) => {
    setSelectedProduct(product);
    setDeleteDialog(true);
  }, []);

  // Handle closing delete dialog
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog(false);
    setSelectedProduct(null);
  }, []);

  // Handle confirming product deletion
  const handleConfirmDelete = useCallback(
    async (product) => {
      if (!product) return;

      setDeleting(true);
      try {
        await deleteAdminProduct(product.product_id);
        showToast("success", "Success", "Product deleted successfully");
        handleCloseDeleteDialog();

        // Handle edge case: if deleting last item on page, go to previous page
        if (products.length === 1 && lazyParams.page > 1) {
          setLazyParams((prev) => ({
            ...prev,
            first: prev.first - prev.rows,
            page: prev.page - 1,
          }));
        } else {
          await loadProducts();
        }
      } catch (error) {
        console.error("Failed to delete product:", error);
        showToast("error", "Error", getErrorMessage(error));
      } finally {
        setDeleting(false);
      }
    },
    [products.length, lazyParams.page, loadProducts, handleCloseDeleteDialog, showToast]
  );

  // Handle toggling product status
  const handleToggleStatus = useCallback(
    async (product, newStatus) => {
      // Optimistically update UI
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === product.product_id
            ? { ...p, is_active: newStatus }
            : p
        )
      );
      // Optimistically update stats
      setTotalActive((prev) => prev + (newStatus ? 1 : -1));

      try {
        await updateProductStatus(product.product_id, newStatus);
        showToast(
          "success",
          "Success",
          `Product ${newStatus ? "activated" : "deactivated"} successfully`
        );
      } catch (error) {
        console.error("Failed to update product status:", error);
        // Revert optimistic updates on failure
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === product.product_id
              ? { ...p, is_active: !newStatus }
              : p
          )
        );
        setTotalActive((prev) => prev + (newStatus ? -1 : 1));
        showToast("error", "Error", getErrorMessage(error));
      }
    },
    [showToast]
  );

  return (
    <div className="admin-products-container animate-fade-in flex-1 flex flex-col min-h-0">
      <Toast ref={toast} position="top-right" />

      <div className="admin-products-card flex-1 flex flex-col min-h-0">
        <AdminProductsToolbar
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          statusFilter={statusFilter}
          onAddProduct={handleAddProduct}
          totalAll={totalAll}
          totalActive={totalActive}
        />

        <AdminProductsTable
          products={products}
          loading={loading}
          totalRecords={totalRecords}
          lazyParams={lazyParams}
          onLazyLoad={handleLazyLoad}
          onEdit={handleEditProduct}
          onDelete={handleDeleteClick}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <ProductFormModal
        visible={productModal}
        onHide={handleCloseProductModal}
        product={selectedProduct}
        onSave={handleSaveProduct}
        saving={saving}
        initialTab={initialTab}
      />

      <ProductDeleteDialog
        visible={deleteDialog}
        onHide={handleCloseDeleteDialog}
        product={selectedProduct}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
      />
    </div>
  );
}

export default AdminProductsTab;
