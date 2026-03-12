import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputSwitch } from "primereact/inputswitch";

function AddressFormFields({
  checkboxClassName = "inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300",
  form,
  onChange,
}) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <FloatLabel>
          <InputText
            id="full_name"
            name="full_name"
            value={form.full_name}
            onChange={onChange}
            className="address-dialog-input w-full !rounded-xl"
          />
          <label htmlFor="full_name">Full name *</label>
        </FloatLabel>
        <FloatLabel>
          <InputText
            id="phone"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="address-dialog-input w-full !rounded-xl"
          />
          <label htmlFor="phone">Phone (10 digits) *</label>
        </FloatLabel>
        <div className="md:col-span-2">
          <FloatLabel>
            <InputTextarea
              id="address_line1"
              name="address_line1"
              value={form.address_line1}
              onChange={onChange}
              rows={2}
              className="address-dialog-input address-dialog-textarea w-full !rounded-xl"
            />
            <label htmlFor="address_line1">Address line 1 *</label>
          </FloatLabel>
        </div>
        <div className="md:col-span-2">
          <FloatLabel>
            <InputTextarea
              id="address_line2"
              name="address_line2"
              value={form.address_line2}
              onChange={onChange}
              rows={2}
              className="address-dialog-input address-dialog-textarea w-full !rounded-xl"
            />
            <label htmlFor="address_line2">Address line 2 (optional)</label>
          </FloatLabel>
        </div>
        <FloatLabel>
          <InputText
            id="city"
            name="city"
            value={form.city}
            onChange={onChange}
            className="address-dialog-input w-full !rounded-xl"
          />
          <label htmlFor="city">City *</label>
        </FloatLabel>
        <FloatLabel>
          <InputText
            id="state"
            name="state"
            value={form.state}
            onChange={onChange}
            className="address-dialog-input w-full !rounded-xl"
          />
          <label htmlFor="state">State *</label>
        </FloatLabel>
        <FloatLabel>
          <InputText
            id="postal_code"
            name="postal_code"
            value={form.postal_code}
            onChange={onChange}
            className="address-dialog-input w-full !rounded-xl"
          />
          <label htmlFor="postal_code">Postal code *</label>
        </FloatLabel>
        <FloatLabel>
          <InputText
            id="country"
            name="country"
            value={form.country}
            onChange={onChange}
            className="address-dialog-input w-full !rounded-xl"
          />
          <label htmlFor="country">Country</label>
        </FloatLabel>
      </div>

      <div className={`${checkboxClassName} rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800`}>
        <InputSwitch
          inputId="is_default"
          checked={form.is_default}
          onChange={(event) =>
            onChange({
              target: {
                name: "is_default",
                type: "checkbox",
                checked: Boolean(event.value),
                value: Boolean(event.value),
              },
            })
          }
        />
        <label htmlFor="is_default">Set as default address</label>
      </div>
    </>
  );
}

export default AddressFormFields;
