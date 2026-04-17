import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { InputText } from "primereact/inputtext";

function EditProfileForm({
  initialValues,
  loading,
  onSubmit,
  onValidationError,
}) {
  const [form, setForm] = useState({
    name: initialValues?.name || "",
  });

  useEffect(() => {
    setForm({
      name: initialValues?.name || "",
    });
  }, [initialValues?.name]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      return "Name is required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      onValidationError?.(validationError);
      return;
    }

    await onSubmit({
      name: form.name.trim(),
    });
  };

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.85)] dark:border-[#1f2933] dark:bg-[#151e22]">
      <div className="flex items-center gap-2">
        <i className="pi pi-user-edit text-[#1A9E8E] dark:text-[#26c9b4]" />
        <h3 className="font-serif text-xl text-slate-900 dark:text-slate-100">
          Edit Profile
        </h3>
      </div>
      <Divider className="!my-3" />
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Update your display name.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="profile_name"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Name
          </label>
          <InputText
            id="profile_name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full !rounded-xl !border-[#DDD8CF] !bg-[#F6F3EE] !px-3 !py-2.5 !text-[#111111] placeholder:!text-[#7C7670] focus:!border-[#1A9E8E] focus:!shadow-none dark:!border-[#2a3f38] dark:!bg-[#1a2e28] dark:!text-[#F6F3EE] dark:placeholder:!text-[#A8A39A]"
          />
        </div>

        <Button
          type="submit"
          label={loading ? "Saving..." : "Save Changes"}
          icon="pi pi-save"
          disabled={loading}
          loading={loading}
          className="!w-full !rounded-xl !bg-[#1A9E8E] !px-4 !py-2 !text-sm !font-semibold !text-white hover:!bg-[#168c7e] sm:!w-auto"
        />
      </form>
    </Card>
  );
}

export default EditProfileForm;
