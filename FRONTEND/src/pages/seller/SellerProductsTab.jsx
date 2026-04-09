import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useToast } from "../../context/ToastContext";
import AdminProductsToolbar from "../admin/AdminProductsToolbar";
import AdminProductsTable from "../admin/AdminProductsTable";
import ProductDeleteDialog from "../admin/ProductDeleteDialog";
import ProductFormModal from "../admin/ProductFormModal";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  updateAdminProduct,
  updateProductStatus,
} from "../../../api/adminProductsApi";
import getApiErrorMessage from "../../utils/apiError";
import "../admin/AdminShared.css";

function SellerProductsTab() {
  const showToast = useToast();
  const { currentUser } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalAll, setTotalAll] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: "",
  });
  const [productModal, setProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [productModalDirty, setProductModalDirty] = useState(false);

  const sellerId = currentUser?.user_id ?? null;

  const loadProducts = useCallback(async () => {
    if (!sellerId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await fetchAdminProducts({
        page: lazyParams.page,
        limit: lazyParams.rows,
        search: lazyParams.search,
        sortField: lazyParams.sortField,
        sortOrder: lazyParams.sortOrder,
        isActive: statusFilter,
        sellerId,
      });

      setProducts(result.data);
      setTotalRecords(result.total);
      setTotalAll(result.totalAll);
      setTotalActive(result.totalActive);
    } catch (error) {
      setProducts([]);
      setTotalRecords(0);
      showToast("error", "Error", getApiErrorMessage(error, "Failed to load your products."));
    } finally {
      setLoading(false);
    }
  }, [lazyParams, sellerId, showToast, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleLazyLoad = useCallback((params) => {
    setLazyParams((prev) => ({ ...prev, ...params }));
  }, []);

  const handleSearch = useCallback((searchValue) => {
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 1,
      search: searchValue,
    }));
  }, []);

  const handleStatusFilter = useCallback((value) => {
    setStatusFilter(value);
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 1,
    }));
  }, []);

  const handleAddProduct = useCallback(() => {
    setSelectedProduct(null);
    setProductModalDirty(false);
    setProductModal(true);
  }, []);

  const handleEditProduct = useCallback((product) => {
    setSelectedProduct(product);
    setProductModalDirty(false);
    setProductModal(true);
  }, []);

  const handleCloseProductModal = useCallback(() => {
    setProductModal(false);
    setSelectedProduct(null);
    if (productModalDirty) {
      loadProducts();
    }
    setProductModalDirty(false);
  }, [loadProducts, productModalDirty]);

  const handleSaveProduct = useCallback(
    async (formData) => {
      try {
        setSaving(true);
        if (selectedProduct) {
          await updateAdminProduct(selectedProduct.product_id, formData);
          setProductModalDirty(true);
          showToast("success", "Success", "Product updated successfully.");
          await loadProducts();
          handleCloseProductModal();
          return;
        }

        const result = await createAdminProduct(formData);
        setProductModalDirty(true);
        showToast("success", "Success", "Product created. Continue adding portions, modifiers, and images.");
        setSelectedProduct({
          product_id: result?.data?.product_id,
          ...formData,
          is_active: formData.is_active ? 1 : 0,
        });
        setLazyParams((prev) => ({ ...prev, first: 0, page: 1 }));
      } catch (error) {
        showToast("error", "Error", getApiErrorMessage(error, "Failed to save product."));
      } finally {
        setSaving(false);
      }
    },
    [handleCloseProductModal, loadProducts, selectedProduct, showToast],
  );

  const handleDeleteClick = useCallback((product) => {
    setSelectedProduct(product);
    setDeleteDialog(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteDialog(false);
    setSelectedProduct(null);
  }, []);

  const handleConfirmDelete = useCallback(
    async (product) => {
      if (!product) {
        return;
      }

      try {
        setDeleting(true);
        await deleteAdminProduct(product.product_id);
        showToast("success", "Success", "Product deleted successfully.");
        handleCloseDeleteDialog();
        await loadProducts();
      } catch (error) {
        showToast("error", "Error", getApiErrorMessage(error, "Failed to delete product."));
      } finally {
        setDeleting(false);
      }
    },
    [handleCloseDeleteDialog, loadProducts, showToast],
  );

  const handleToggleStatus = useCallback(
    async (product, newStatus) => {
      const previousStatus = Boolean(product.is_active);

      setProducts((prev) =>
        prev.map((item) =>
          item.product_id === product.product_id ? { ...item, is_active: newStatus } : item,
        ),
      );
      if (previousStatus !== newStatus) {
        setTotalActive((prev) => prev + (newStatus ? 1 : -1));
      }

      try {
        await updateProductStatus(product.product_id, newStatus);
        showToast(
          "success",
          "Success",
          `Product ${newStatus ? "activated" : "deactivated"} successfully.`,
        );
      } catch (error) {
        setProducts((prev) =>
          prev.map((item) =>
            item.product_id === product.product_id
              ? { ...item, is_active: previousStatus }
              : item,
          ),
        );
        if (previousStatus !== newStatus) {
          setTotalActive((prev) => prev + (previousStatus ? 1 : -1));
        }
        showToast("error", "Error", getApiErrorMessage(error, "Failed to update product status."));
      }
    },
    [showToast],
  );

  return (
    <div className="admin-products-container animate-fade-in flex-1 flex flex-col min-h-0">
      <div className="mb-5">
        <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">Catalog</p>
        <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
          Your products
        </h2>
      </div>

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
        onMutate={() => setProductModalDirty(true)}
        saving={saving}
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

export default SellerProductsTab;
