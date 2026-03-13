import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

const roleOptions = [
  { label: "Customer", value: "customer" },
  { label: "Admin", value: "admin" },
];

function AdminUserCreateDialog({ visible, onHide, onSubmit, loading }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");

  useEffect(() => {
    if (!visible) {
      setName("");
      setEmail("");
      setRole("customer");
    }
  }, [visible]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmit({ name: name.trim(), email: email.trim(), role });
  };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        label="Cancel"
        onClick={onHide}
        disabled={loading}
        className="admin-btn-secondary px-4 py-2 rounded-lg font-medium transition-colors"
        pt={{ root: { className: "border-none bg-transparent" } }}
      />
      <Button
        type="submit"
        form="admin-create-user-form"
        label={loading ? "Creating..." : "Create User"}
        disabled={loading || !name.trim() || !email.trim()}
        className="admin-btn-primary px-5 py-2 rounded-lg font-semibold shadow-sm transition-colors"
      />
    </div>
  );

  return (
    <Dialog
      header="Create User"
      visible={visible}
      style={{ width: "460px" }}
      breakpoints={{ "641px": "95vw" }}
      onHide={onHide}
      dismissableMask
      footer={footer}
      pt={{
        root: { className: "border-0 shadow-2xl rounded-2xl overflow-hidden admin-dialog" },
        header: { className: "admin-dialog-header px-6 py-4 border-b" },
        content: { className: "p-6" },
        footer: { className: "admin-dialog-footer px-6 py-4 border-t rounded-b-2xl" },
      }}
    >
      <form id="admin-create-user-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full Name</label>
          <InputText
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            className="admin-input w-full mt-2"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email Address</label>
          <InputText
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@example.com"
            className="admin-input w-full mt-2"
            type="email"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Role</label>
          <Dropdown
            value={role}
            onChange={(event) => setRole(event.value)}
            options={roleOptions}
            className="admin-dropdown-root w-full mt-2"
            panelClassName="admin-dropdown-panel"
          />
        </div>
      </form>
    </Dialog>
  );
}

export default AdminUserCreateDialog;
