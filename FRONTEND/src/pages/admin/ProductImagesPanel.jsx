/**
 * @component ProductImagesPanel
 * @description Tab panel for managing product and modifier images.
 *
 * Two sections:
 *  1. Product primary image — upload, replace, or delete the main PRODUCT-level image
 *  2. Modifier images      — one image per modifier-portion link (MODIFIER-level)
 *
 * Images are uploaded to Cloudinary via adminProductImagesApi (multipart/form-data).
 * Thumbnails use Cloudinary URL transforms for optimized loading.
 *
 * Data sources:
 *  - adminProductImagesApi  → image CRUD
 *  - adminPortionsApi       → fetch product-portions to discover modifiers
 *  - adminModifiersApi      → fetch modifiers by portion or by product
 *
 * Props: product, showToast
 * Consumed by: ProductFormModal (Images tab)
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { ProgressSpinner } from "primereact/progressspinner";
import { Upload, Trash2, RefreshCw, ImageOff } from "lucide-react";
import {
  fetchProductImages,
  uploadProductImage,
  updateProductImage,
  deleteProductImage,
} from "../../../api/adminProductImagesApi";
import { fetchProductPortions } from "../../../api/adminPortionsApi";
import {
  fetchModifiersByProductPortion,
  fetchModifiersByProduct,
} from "../../../api/adminModifiersApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/** Insert Cloudinary transforms into a URL for optimized thumbnails. */
const cloudinaryThumb = (url, size = 80) => {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/w_${size},h_${size},c_fill,q_auto,f_auto/`
  );
};

function validateImageFile(file, showToast) {
  if (!file) return false;
  if (!file.type.startsWith("image/")) {
    showToast("warn", "Invalid File", "Only image files are allowed");
    return false;
  }
  if (file.size > MAX_FILE_SIZE) {
    showToast("warn", "File Too Large", "Image must be under 5 MB");
    return false;
  }
  return true;
}

function ProductImagesPanel({ product, showToast }) {
  const productId = product?.product_id;

  // Data
  const [allImages, setAllImages] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingModifiers, setLoadingModifiers] = useState(true);

  // Upload / delete spinners
  const [uploadingProduct, setUploadingProduct] = useState(false);
  const [uploadingModifiers, setUploadingModifiers] = useState({});
  const [deletingImages, setDeletingImages] = useState({});

  // ── Fetch images ──
  const refreshImages = useCallback(async () => {
    if (!productId) return;
    try {
      const imgs = await fetchProductImages(productId);
      setAllImages(imgs);
    } catch (err) {
      showToast("error", "Error", err.response?.data?.message || err.message);
    }
  }, [productId, showToast]);

  // ── Load everything on mount ──
  useEffect(() => {
    if (!productId) return;

    const load = async () => {
      setLoading(true);
      setLoadingModifiers(true);
      try {
        // Images
        const imgs = await fetchProductImages(productId);
        setAllImages(imgs);

        // Portions → modifiers
        const portions = await fetchProductPortions(productId);
        let allMods = [];
        if (portions.length === 0) {
          allMods = await fetchModifiersByProduct(productId);
        } else {
          const arrays = await Promise.all(
            portions.map((pp) =>
              fetchModifiersByProductPortion(pp.product_portion_id)
            )
          );
          allMods = arrays.flat();
        }
        setModifiers(allMods);
      } catch (err) {
        showToast("error", "Error", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
        setLoadingModifiers(false);
      }
    };
    load();
  }, [productId, showToast]);

  // ── Derived data ──
  const productImage = useMemo(
    () =>
      allImages.find(
        (img) => img.image_level === "PRODUCT" && img.is_primary
      ) ||
      allImages.find((img) => img.image_level === "PRODUCT") ||
      null,
    [allImages]
  );

  const modifierImageMap = useMemo(() => {
    const map = {};
    allImages
      .filter((img) => img.image_level === "MODIFIER")
      .forEach((img) => {
        map[img.modifier_portion_id] = img;
      });
    return map;
  }, [allImages]);

  // ── Handlers ──
  const handleUploadProductImage = async (file) => {
    if (!validateImageFile(file, showToast)) return;
    setUploadingProduct(true);
    try {
      await uploadProductImage({
        file,
        product_id: productId,
        image_level: "PRODUCT",
        is_primary: 1,
      });
      showToast("success", "Success", "Product image uploaded");
      await refreshImages();
    } catch (err) {
      showToast("error", "Error", err.response?.data?.message || err.message);
    } finally {
      setUploadingProduct(false);
    }
  };

  const handleReplaceProductImage = async (file) => {
    if (!validateImageFile(file, showToast) || !productImage) return;
    setUploadingProduct(true);
    try {
      await updateProductImage(productImage.image_id, file);
      showToast("success", "Success", "Product image replaced");
      await refreshImages();
    } catch (err) {
      showToast("error", "Error", err.response?.data?.message || err.message);
    } finally {
      setUploadingProduct(false);
    }
  };

  const handleUploadModifierImage = async (modifierPortionId, file) => {
    if (!validateImageFile(file, showToast)) return;
    setUploadingModifiers((prev) => ({ ...prev, [modifierPortionId]: true }));
    try {
      await uploadProductImage({
        file,
        product_id: productId,
        image_level: "MODIFIER",
        modifier_portion_id: modifierPortionId,
        is_primary: 0,
      });
      showToast("success", "Success", "Modifier image uploaded");
      await refreshImages();
    } catch (err) {
      showToast("error", "Error", err.response?.data?.message || err.message);
    } finally {
      setUploadingModifiers((prev) => ({ ...prev, [modifierPortionId]: false }));
    }
  };

  const handleReplaceModifierImage = async (modifierPortionId, imageId, file) => {
    if (!validateImageFile(file, showToast)) return;
    setUploadingModifiers((prev) => ({ ...prev, [modifierPortionId]: true }));
    try {
      await updateProductImage(imageId, file);
      showToast("success", "Success", "Modifier image replaced");
      await refreshImages();
    } catch (err) {
      showToast("error", "Error", err.response?.data?.message || err.message);
    } finally {
      setUploadingModifiers((prev) => ({ ...prev, [modifierPortionId]: false }));
    }
  };

  const handleDeleteImage = async (imageId) => {
    setDeletingImages((prev) => ({ ...prev, [imageId]: true }));
    try {
      await deleteProductImage(imageId);
      showToast("success", "Success", "Image deleted");
      await refreshImages();
    } catch (err) {
      showToast("error", "Error", err.response?.data?.message || err.message);
    } finally {
      setDeletingImages((prev) => ({ ...prev, [imageId]: false }));
    }
  };

  // ── File input handler helper (resets input so same file can be re-selected) ──
  const onFileSelect = (handler) => (e) => {
    const file = e.target.files?.[0];
    if (file) handler(file);
    e.target.value = "";
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12">
        <ProgressSpinner style={{ width: "24px", height: "24px" }} strokeWidth="4" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading images...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* ════════ Section 1: Product Primary Image ════════ */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Product Image
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          The main image shown in product listings and detail pages.
        </p>

        <div className="flex items-center gap-4">
          {productImage ? (
            /* ── Existing image preview ── */
            <div className="admin-image-preview w-40 h-40">
              <img
                src={cloudinaryThumb(productImage.image_url, 320)}
                alt="Product"
                className="w-full h-full object-cover"
              />
              <div className="admin-image-overlay">
                {deletingImages[productImage.image_id] ? (
                  <ProgressSpinner style={{ width: "20px", height: "20px" }} strokeWidth="4" />
                ) : (
                  <>
                    <label className="admin-image-overlay-btn">
                      <RefreshCw className="h-4 w-4" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileSelect(handleReplaceProductImage)}
                      />
                    </label>
                    <button
                      className="admin-image-overlay-btn danger"
                      onClick={() => handleDeleteImage(productImage.image_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
              <div className="admin-image-primary-badge">PRIMARY</div>
            </div>
          ) : (
            /* ── Empty upload dropzone ── */
            <label className="admin-image-dropzone flex flex-col items-center justify-center w-40 h-40">
              {uploadingProduct ? (
                <ProgressSpinner style={{ width: "24px", height: "24px" }} strokeWidth="4" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-gray-400 dark:text-gray-500 mb-2" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Upload Image
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Max 5 MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingProduct}
                onChange={onFileSelect(handleUploadProductImage)}
              />
            </label>
          )}

          {uploadingProduct && productImage && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <ProgressSpinner style={{ width: "18px", height: "18px" }} strokeWidth="4" />
              <span>Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* ════════ Section 2: Modifier Images ════════ */}
      {!loadingModifiers && modifiers.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Modifier Images
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Upload an image for each modifier. Shown when a customer selects that option.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {modifiers.map((mod) => {
              const modImage = modifierImageMap[mod.modifier_portion_id];
              const isUploading = uploadingModifiers[mod.modifier_portion_id];
              const isDeleting = modImage && deletingImages[modImage.image_id];

              return (
                <div key={mod.modifier_portion_id} className="admin-modifier-image-card">
                  {/* Thumbnail slot */}
                  {modImage ? (
                    <div className="admin-image-preview w-14 h-14 flex-shrink-0" style={{ borderRadius: "0.5rem" }}>
                      <img
                        src={cloudinaryThumb(modImage.image_url, 112)}
                        alt={mod.modifier_value}
                        className="w-full h-full object-cover"
                      />
                      <div className="admin-image-overlay" style={{ borderRadius: "0.5rem" }}>
                        {isDeleting ? (
                          <ProgressSpinner style={{ width: "14px", height: "14px" }} strokeWidth="5" />
                        ) : (
                          <>
                            <label className="admin-image-overlay-btn" style={{ padding: "0.25rem" }}>
                              <RefreshCw className="h-3 w-3" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onFileSelect((file) =>
                                  handleReplaceModifierImage(mod.modifier_portion_id, modImage.image_id, file)
                                )}
                              />
                            </label>
                            <button
                              className="admin-image-overlay-btn danger"
                              style={{ padding: "0.25rem" }}
                              onClick={() => handleDeleteImage(modImage.image_id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label className="admin-image-dropzone w-14 h-14 flex-shrink-0 flex items-center justify-center" style={{ borderRadius: "0.5rem" }}>
                      {isUploading ? (
                        <ProgressSpinner style={{ width: "16px", height: "16px" }} strokeWidth="5" />
                      ) : (
                        <Upload className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={onFileSelect((file) =>
                          handleUploadModifierImage(mod.modifier_portion_id, file)
                        )}
                      />
                    </label>
                  )}

                  {/* Modifier label */}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {mod.modifier_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {mod.modifier_value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── No modifiers message ── */}
      {!loadingModifiers && modifiers.length === 0 && (
        <div className="flex flex-col items-center py-6 text-center">
          <ImageOff className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No modifiers assigned yet. Add modifiers on the <strong>Modifiers</strong> tab to upload individual modifier images.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductImagesPanel;