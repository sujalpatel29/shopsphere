import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import AddressFormFields from "./AddressFormFields";

function AddAddressModal({
  addressActionError,
  addressForm,
  addressFormError,
  addingAddress,
  onChange,
  onHide,
  onSubmit,
  visible,
}) {
  return (
    <Dialog
      header="Add New Address"
      className="!overflow-hidden"
      visible={visible}
      style={{ width: "92vw", maxWidth: "760px" }}
      breakpoints={{ "960px": "94vw", "641px": "96vw" }}
      onHide={onHide}
      dismissableMask
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Add an accurate delivery address for smooth order fulfillment.
        </p>
        <AddressFormFields
          form={addressForm}
          onChange={onChange}
          checkboxClassName="mt-2 inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300"
        />
        <Divider className="!my-1" />
        {addressFormError && <Message severity="error" text={addressFormError} />}
        {addressActionError && <Message severity="error" text={addressActionError} />}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={onHide}
            disabled={addingAddress}
            className="!w-full !rounded-xl sm:!w-auto"
          />
          <Button
            type="submit"
            label={addingAddress ? "Adding..." : "Save Address"}
            icon="pi pi-check"
            disabled={addingAddress}
            loading={addingAddress}
            className="!w-full !rounded-xl !bg-amber-500 !px-4 !py-2 !text-sm !font-semibold !text-[#132a29] hover:!bg-amber-400 sm:!w-auto"
          />
        </div>
      </form>
    </Dialog>
  );
}

export default AddAddressModal;
