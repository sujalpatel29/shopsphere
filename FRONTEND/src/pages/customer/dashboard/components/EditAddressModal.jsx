import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import AddressFormFields from "./AddressFormFields";

function EditAddressModal({
  addressActionError,
  addressFormError,
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
      className="!overflow-hidden"
      visible={visible}
      style={{ width: "92vw", maxWidth: "760px" }}
      breakpoints={{ "960px": "94vw", "641px": "96vw" }}
      onHide={onHide}
      dismissableMask
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Update this address to keep your delivery details accurate.
        </p>
        <AddressFormFields form={form} onChange={onChange} />
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
            disabled={updating}
            className="!w-full !rounded-xl sm:!w-auto"
          />
          <Button
            type="submit"
            label={updating ? "Saving..." : "Save Changes"}
            icon="pi pi-save"
            disabled={updating}
            loading={updating}
            className="!w-full !rounded-xl !bg-amber-500 !px-4 !py-2 !text-sm !font-semibold !text-[#132a29] hover:!bg-amber-400 sm:!w-auto"
          />
        </div>
      </form>
    </Dialog>
  );
}

export default EditAddressModal;
