/**
 * @component ModifierFormModal
 * @description PrimeReact Dialog for creating and editing standalone modifiers.
 *
 * Form fields: modifier_name (required), modifier_value (required),
 *              additional_price (INR), is_active toggle.
 * Validates with Formik + Yup. 2-column grid layout on desktop.
 *
 * Props: visible, onHide, modifier (null = create), onSave, saving
 * Consumed by: AdminModifiersTab
 */
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputSwitch } from "primereact/inputswitch";
import { Button } from "primereact/button";

const validationSchema = Yup.object().shape({
  modifier_name: Yup.string()
    .required("Modifier name is required")
    .min(1, "Modifier name is required")
    .max(100, "Max 100 characters"),
  modifier_value: Yup.string()
    .required("Modifier value is required")
    .min(1, "Modifier value is required")
    .max(100, "Max 100 characters"),
  additional_price: Yup.number()
    .nullable()
    .min(0, "Price must be 0 or greater"),
  is_active: Yup.boolean(),
});

function ModifierFormModal({ visible, onHide, modifier, onSave, saving }) {
  const isEditing = Boolean(modifier);

  const formik = useFormik({
    initialValues: {
      modifier_name: "",
      modifier_value: "",
      additional_price: null,
      is_active: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSave({
        ...values,
        additional_price: values.additional_price || 0,
        is_active: values.is_active ? 1 : 0,
      });
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (visible) {
      if (modifier) {
        formik.setValues({
          modifier_name: modifier.modifier_name || "",
          modifier_value: modifier.modifier_value || "",
          additional_price: modifier.additional_price ? Number(modifier.additional_price) : null,
          is_active: Boolean(modifier.is_active),
        });
      } else {
        formik.resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modifier, visible]);

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
      header={isEditing ? "Edit Modifier" : "Add New Modifier"}
      visible={visible}
      style={{ width: "500px" }}
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
      <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 font-sans">
        <div className="flex flex-col gap-2">
          <label htmlFor="modifier_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Modifier Name <span className="text-red-500">*</span>
          </label>
          <InputText
            id="modifier_name"
            name="modifier_name"
            value={formik.values.modifier_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`admin-input w-full rounded-lg h-10 px-3 text-sm ${isFieldInvalid("modifier_name") ? "p-invalid border-red-500" : ""}`}
            placeholder="e.g. Color, RAM, Size"
          />
          {getErrorMessage("modifier_name")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="modifier_value" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Modifier Value <span className="text-red-500">*</span>
          </label>
          <InputText
            id="modifier_value"
            name="modifier_value"
            value={formik.values.modifier_value}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`admin-input w-full rounded-lg h-10 px-3 text-sm ${isFieldInvalid("modifier_value") ? "p-invalid border-red-500" : ""}`}
            placeholder="e.g. Black, 8 GB, XL"
          />
          {getErrorMessage("modifier_value")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="additional_price" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Additional Price
          </label>
          <InputNumber
            inputId="additional_price"
            name="additional_price"
            value={formik.values.additional_price}
            onValueChange={(e) => formik.setFieldValue("additional_price", e.value)}
            onBlur={formik.handleBlur}
            mode="currency"
            currency="INR"
            locale="en-IN"
            min={0}
            className="admin-inputnumber-wrap w-full"
            pt={{ input: { className: "admin-input w-full rounded-lg h-10 px-3 text-sm" } }}
          />
          {getErrorMessage("additional_price")}
        </div>

        <div className="flex flex-col gap-2 justify-end">
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
              {formik.values.is_active ? "Modifier is available" : "Modifier is hidden"}
            </span>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

export default ModifierFormModal;
