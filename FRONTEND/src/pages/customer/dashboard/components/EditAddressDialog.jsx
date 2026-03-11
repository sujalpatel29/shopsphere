import EditAddressModal from "./EditAddressModal";

function EditAddressDialog({
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
    <EditAddressModal
      visible={visible}
      form={form}
      updating={updating}
      addressFormError={addressFormError}
      addressActionError={addressActionError}
      onHide={onHide}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}

export default EditAddressDialog;
