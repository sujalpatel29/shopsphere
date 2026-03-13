import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import AddressFormFields from "./AddressFormFields";

function EditAddressModal({
  form,
  onChange,
  onHide,
  onSubmit,
  updating,
  visible,
}) {
  return (
    <Dialog
      header="Edit Address"
      className="address-dialog !overflow-hidden"
      visible={visible}
      style={{ width: "92vw", maxWidth: "760px" }}
      breakpoints={{ "960px": "94vw", "641px": "96vw" }}
      onHide={onHide}
      dismissableMask
    >
      <form onSubmit={onSubmit} className="address-dialog-form space-y-5">
        <p className="address-dialog-subtitle text-sm text-slate-500 dark:text-slate-400">
          Update this address to keep your delivery details accurate.
        </p>
        <AddressFormFields form={form} onChange={onChange} />
        <Divider className="!my-2 address-dialog-divider" />
        <div className="address-dialog-actions flex flex-wrap justify-end gap-2 pt-1">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            outlined
            onClick={onHide}
            disabled={updating}
            className="!w-full !rounded-xl !border-slate-300 !text-slate-700 hover:!bg-slate-100 dark:!border-slate-600 dark:!text-slate-200 dark:hover:!bg-slate-800 sm:!w-auto"
          />
          <Button
            type="submit"
            label={updating ? "Saving..." : "Save Changes"}
            icon="pi pi-save"
            disabled={updating}
            loading={updating}
            className="!w-full !rounded-xl !bg-[#1d7f75] !px-5 !py-2.5 !text-sm !font-semibold !text-white hover:!bg-[#17665e] sm:!w-auto"
          />
        </div>
      </form>
    </Dialog>
  );
}

export default EditAddressModal;
