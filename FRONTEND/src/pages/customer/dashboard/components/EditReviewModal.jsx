import { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { Rating } from "primereact/rating";

function EditReviewModal({
  error,
  mode,
  onHide,
  onSubmit,
  review,
  reviewableProducts,
  saving,
  visible,
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [productId, setProductId] = useState(null);
  const [formError, setFormError] = useState("");

  const isCreateMode = mode === "create";

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (isCreateMode) {
      setRating(0);
      setTitle("");
      setReviewText("");
      setProductId(reviewableProducts?.[0]?.product_id ?? null);
      setFormError("");
      return;
    }

    setRating(Number(review?.rating) || 0);
    setTitle(review?.title || "");
    setReviewText(review?.review_text || "");
    setProductId(Number(review?.product_id) || null);
    setFormError("");
  }, [isCreateMode, review, reviewableProducts, visible]);

  const productOptions = useMemo(
    () =>
      (reviewableProducts || []).map((product) => ({
        label: product.product_name || `Product #${product.product_id}`,
        value: Number(product.product_id),
      })),
    [reviewableProducts],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!rating || Number(rating) < 1) {
      setFormError("Please select a rating.");
      return;
    }

    if (isCreateMode && !productId) {
      setFormError("Please select a product.");
      return;
    }

    const payload = {
      rating: Number(rating),
      title: title.trim() || null,
      review_text: reviewText.trim() || null,
    };

    if (isCreateMode) {
      payload.product_id = Number(productId);
    }

    await onSubmit(payload);
  };

  return (
    <Dialog
      header={isCreateMode ? "Write Review" : "Edit Review"}
      className="!overflow-hidden"
      visible={visible}
      style={{ width: "92vw", maxWidth: "760px" }}
      breakpoints={{ "960px": "94vw", "641px": "96vw" }}
      onHide={onHide}
      dismissableMask
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isCreateMode
            ? "Share your product experience to help other customers."
            : "Update your review details."}
        </p>
        {isCreateMode && (
          <FloatLabel>
            <Dropdown
              inputId="review_product"
              value={productId}
              onChange={(event) => setProductId(event.value)}
              options={productOptions}
              optionLabel="label"
              optionValue="value"
              className="w-full !rounded-xl"
              filter
            />
            <label htmlFor="review_product">Product</label>
          </FloatLabel>
        )}

        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            Rating
          </p>
          <div className="mt-2">
            <Rating value={rating} onChange={(event) => setRating(event.value)} cancel={false} />
          </div>
        </div>

        <FloatLabel>
          <InputText
            id="review_title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full !rounded-xl"
          />
          <label htmlFor="review_title">Review Title</label>
        </FloatLabel>

        <FloatLabel>
          <InputTextarea
            id="review_text"
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            className="w-full !rounded-xl"
            rows={4}
          />
          <label htmlFor="review_text">Review Text</label>
        </FloatLabel>

        <Divider className="!my-1" />

        {formError && <Message severity="error" text={formError} />}
        {error && <Message severity="error" text={error} />}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={onHide}
            disabled={saving}
            className="!w-full !rounded-xl sm:!w-auto"
          />
          <Button
            type="submit"
            label={saving ? "Saving..." : isCreateMode ? "Submit Review" : "Save Changes"}
            icon={isCreateMode ? "pi pi-send" : "pi pi-save"}
            disabled={saving}
            loading={saving}
            className="!w-full !rounded-xl !bg-amber-500 !px-4 !py-2 !text-sm !font-semibold !text-[#132a29] hover:!bg-amber-400 sm:!w-auto"
          />
        </div>
      </form>
    </Dialog>
  );
}

export default EditReviewModal;
