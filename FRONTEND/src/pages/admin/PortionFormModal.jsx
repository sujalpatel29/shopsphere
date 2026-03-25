/**
 * @component PortionFormModal
 * @description PrimeReact Dialog for creating and editing standalone portions.
 *
 * Form fields: portion_value (required), description, is_active toggle.
 * Validates with Formik + Yup. Resets form state when dialog opens/closes.
 *
 * Props: visible, onHide, portion (null = create), onSave, saving
 * Consumed by: AdminPortionsTab
 */
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";

const validationSchema = Yup.object().shape({
  portion_value: Yup.string()
    .required("Portion value is required")
    .min(1, "Portion value is required")
    .max(50, "Max 50 characters"),
  description: Yup.string().max(255, "Max 255 characters"),
  is_active: Yup.boolean(),
});

function PortionFormModal({ visible, onHide, portion, onSave, saving }) {
  const isEditing = Boolean(portion);

  const formik = useFormik({
    initialValues: {
      portion_value: "",
      description: "",
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSave({
        ...values,
        is_active: values.is_active ? 1 : 0,
      });
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (visible) {
      if (portion) {
        formik.setValues({
          portion_value: portion.portion_value || "",
          description: portion.description || "",
          is_active: Boolean(portion.is_active),
        });
      } else {
        formik.resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portion, visible]);

  const isFieldInvalid = (fieldName) =>
    formik.touched[fieldName] && formik.errors[fieldName];

  const getErrorMessage = (fieldName) =>
    formik.touched[fieldName] && formik.errors[fieldName] ? (
      <small className="text-red-500 text-xs mt-1 block">
        {formik.errors[fieldName]}
      </small>
    ) : null;

  const footerContent = (
    <div className="flex justify-end gap-3 mt-4">
      <Button
        type="button"
        label="Cancel"
        onClick={onHide}
        disabled={saving}
        className="admin-btn-secondary px-4 py-2 rounded-lg font-medium transition-colors"
        pt={{ root: { className: "border-none bg-transparent" } }}
      />
      <Button
        type="submit"
        label={saving ? "Saving..." : "Save"}
        onClick={formik.handleSubmit}
        disabled={saving || formik.isSubmitting}
        className="admin-btn-primary px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        pt={{ root: { className: "flex items-center justify-center" } }}
      />
    </div>
  );

  return (
    <Dialog
      header={isEditing ? "Edit Portion" : "Add New Portion"}
      visible={visible}
      style={{ width: "450px" }}
      breakpoints={{ "641px": "90vw" }}
      footer={footerContent}
      onHide={onHide}
      dismissableMask
      pt={{
        root: { className: "border-0 shadow-2xl rounded-2xl overflow-hidden admin-dialog" },
        header: { className: "admin-dialog-header px-6 py-5 border-b" },
        title: { className: "text-xl font-serif font-semibold" },
        content: { className: "p-6" },
        footer: { className: "admin-dialog-footer px-6 py-4 border-t rounded-b-2xl" },
        closeButton: { className: "w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors" },
      }}
    >
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5 mt-2 font-sans">
        <div className="flex flex-col gap-2">
          <label htmlFor="portion_value" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Portion Value <span className="text-red-500">*</span>
          </label>
          <InputText
            id="portion_value"
            name="portion_value"
            value={formik.values.portion_value}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`admin-input w-full rounded-lg h-10 px-3 text-sm ${isFieldInvalid("portion_value") ? "p-invalid border-red-500" : ""}`}
            placeholder="e.g. 128 GB, S, M, L, UK 8"
          />
          {getErrorMessage("portion_value")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Description
          </label>
          <InputText
            id="description"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="admin-input w-full rounded-lg h-10 px-3 text-sm"
            placeholder="e.g. Storage capacity 128 gigabytes"
          />
          {getErrorMessage("description")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Active Status
          </label>
          <div className="flex items-center gap-3 mt-1">
            <InputSwitch
              id="is_active"
              checked={formik.values.is_active}
              onChange={(e) => formik.setFieldValue("is_active", e.value)}
              className="admin-status-switch"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formik.values.is_active ? "Portion is available" : "Portion is hidden"}
            </span>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

export default PortionFormModal;