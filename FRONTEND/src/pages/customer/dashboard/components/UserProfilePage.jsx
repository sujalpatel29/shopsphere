import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";
import api from "../../../../../api/api";
import {
  applyToBeSeller,
  getMySellerProfile,
} from "../../../../../api/sellerApi";
import EditProfileForm from "./EditProfileForm";

const extractData = (response) => response?.data?.data ?? null;

const extractMessage = (response, fallback) =>
  response?.data?.message || response?.data?.data?.message || fallback;

const extractErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  const errors = responseData?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map((entry) => entry?.message || "Invalid value").join(" | ");
  }

  return error?.message || fallback;
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const validateSellerForm = (form) => {
  const errors = {};

  if (!form.business_name?.trim()) {
    errors.business_name = "Business name is required";
  } else if (form.business_name.length < 2) {
    errors.business_name = "Business name must be at least 2 characters";
  }

  if (form.phone && form.phone.length > 0) {
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 6 || cleanPhone.length > 15) {
      errors.phone = "Enter a valid phone number";
    }
  }

  if (form.gst_number && form.gst_number.length > 0) {
    const cleanGst = form.gst_number.replace(/\W/g, "").toUpperCase();
    if (cleanGst.length < 10) {
      errors.gst_number = "Enter a valid GST number (min 10 characters)";
    }
  }

  if (form.bank_account_number && form.bank_account_number.length > 0) {
    const cleanAccount = form.bank_account_number.replace(/\D/g, "");
    if (cleanAccount.length < 6 || cleanAccount.length > 20) {
      errors.bank_account_number = "Enter a valid bank account number";
    }
  }

  if (form.bank_ifsc_code && form.bank_ifsc_code.length > 0) {
    const cleanIfsc = form.bank_ifsc_code.replace(/\W/g, "").toUpperCase();
    if (cleanIfsc.length < 9 || cleanIfsc.length > 18) {
      errors.bank_ifsc_code = "Enter a valid IFSC code";
    }
  }

  if (
    form.bank_account_holder &&
    form.bank_account_holder.length > 0 &&
    form.bank_account_holder.length < 2
  ) {
    errors.bank_account_holder =
      "Account holder name must be at least 2 characters";
  }

  return errors;
};

function ProfileInfoTile({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 shadow-[0_14px_24px_-28px_rgba(15,23,42,0.9)] dark:border-slate-700 dark:bg-slate-800/80">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <i className={`${icon} text-sm text-[#1A9E8E] dark:text-[#26c9b4]`} />
      </div>
      <p className="mt-2 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function UserProfilePage({ currentUser, showToast }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [sellerStatus, setSellerStatus] = useState(null);
  const [applyDialogVisible, setApplyDialogVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [sellerForm, setSellerForm] = useState({
    business_name: "",
    business_description: "",
    business_address: "",
    phone: "",
    gst_number: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_account_holder: "",
  });
  const toast = useRef(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get("/users/view-profile");
      const payload = extractData(response);
      const normalized = Array.isArray(payload) ? payload[0] : payload;
      setProfile(normalized || null);
    } catch (error) {
      setErrorMessage(
        extractErrorMessage(
          error,
          "Failed to fetch profile details. Please refresh and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const checkSellerStatus = useCallback(async () => {
    try {
      const res = await getMySellerProfile();
      if (res.data?.success) {
        setSellerStatus(res.data.data?.verification_status || "pending");
      }
    } catch (err) {
      setSellerStatus(null);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    checkSellerStatus();
  }, [loadProfile, checkSellerStatus]);

  useEffect(() => {
    if (!infoMessage) {
      return;
    }

    showToast?.("success", "Success", infoMessage);
  }, [infoMessage, showToast]);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    showToast?.("error", "Error", errorMessage);
  }, [errorMessage, showToast]);

  const profileSummary = useMemo(
    () => ({
      name: profile?.name || currentUser?.name || "-",
      email: profile?.email || currentUser?.email || "-",
      role: profile?.role || currentUser?.role || "customer",
      lastLogin:
        formatDateTime(
          profile?.last_login ||
            profile?.lastLogin ||
            profile?.updated_at ||
            profile?.created_at,
        ) || "-",
    }),
    [currentUser?.email, currentUser?.name, currentUser?.role, profile],
  );

  const handleProfileUpdate = useCallback(
    async (payload) => {
      setUpdatingProfile(true);
      setInfoMessage("");
      setErrorMessage("");

      try {
        const response = await api.put("/users/update", payload);
        setInfoMessage(
          extractMessage(response, "Profile updated successfully."),
        );
        await loadProfile();
      } catch (error) {
        setErrorMessage(
          extractErrorMessage(error, "Failed to update profile details."),
        );
      } finally {
        setUpdatingProfile(false);
      }
    },
    [loadProfile],
  );

  const handleSellerInputChange = (e) => {
    const { name, value } = e.target;
    setSellerForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleApplyToBeSeller = async () => {
    const errors = validateSellerForm(sellerForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setApplying(true);
      await applyToBeSeller(sellerForm);

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Application submitted! Wait for admin approval.",
        life: 3000,
      });

      setApplyDialogVisible(false);
      setSellerStatus("pending");
      setSellerForm({
        business_name: "",
        business_description: "",
        business_address: "",
        phone: "",
        gst_number: "",
        bank_account_number: "",
        bank_ifsc_code: "",
        bank_account_holder: "",
      });
      setFormErrors({});
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: extractErrorMessage(error, "Failed to submit application"),
        life: 5000,
      });
    } finally {
      setApplying(false);
    }
  };

  const isSeller = currentUser?.role === "seller";

  if (loading) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.8)] dark:border-[#1f2933] dark:bg-[#151e22]">
        <div className="flex items-center gap-3">
          <ProgressSpinner
            style={{ width: "24px", height: "24px" }}
            strokeWidth="4"
          />
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Loading profile details...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Toast ref={toast} />
      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_38px_-30px_rgba(15,23,42,0.85)] dark:border-[#1f2933] dark:bg-[#151e22]">
        <div className="relative bg-gradient-to-r from-[#163332] to-[#1d4745] px-5 py-6 text-white sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_65%)]" />
          <div className="relative z-10 flex flex-wrap items-center gap-4">
            <Avatar
              shape="circle"
              size="xlarge"
              className="!bg-[#1A9E8E]/15 !text-[#1A9E8E]"
            >
              {(profileSummary.name || "U").charAt(0).toUpperCase()}
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs tracking-[0.18em] text-[#1A9E8E]">
                ACCOUNT PROFILE
              </p>
              <h2 className="truncate font-serif text-xl text-white sm:text-2xl">
                {profileSummary.name}
              </h2>
              <p className="truncate text-sm text-slate-100/90">
                {profileSummary.email}
              </p>
            </div>
            <Chip
              label={profileSummary.role}
              className="!bg-white/15 !text-xs !font-semibold !uppercase !tracking-[0.08em] !text-white"
            />
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ProfileInfoTile
              icon="pi pi-user"
              label="Name"
              value={profileSummary.name}
            />
            <ProfileInfoTile
              icon="pi pi-envelope"
              label="Email"
              value={profileSummary.email}
            />
            <ProfileInfoTile
              icon="pi pi-id-card"
              label="Role"
              value={profileSummary.role}
            />
            <ProfileInfoTile
              icon="pi pi-clock"
              label="Last Login"
              value={profileSummary.lastLogin}
            />
          </div>
        </div>
      </Card>

      {!isSeller && !sellerStatus && (
        <Card className="rounded-2xl border border-[#1A9E8E]/30 bg-[#e6f7f5]/80 p-6 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.8)] dark:border-[#1A9E8E]/50 dark:bg-[#1A9E8E]/10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h3 className="text-lg font-semibold text-[#117a6e] dark:text-[#4dd3c2]">
                Become a Seller
              </h3>
              <p className="text-sm text-[#1A9E8E] dark:text-[#26c9b4]">
                Start selling your products on our platform
              </p>
            </div>
            <Button
              label="Apply Now"
              icon="pi pi-store"
              onClick={() => setApplyDialogVisible(true)}
              className="!bg-[#1A9E8E] !border-[#1A9E8E] hover:!bg-[#168c7e]"
            />
          </div>
        </Card>
      )}

      {sellerStatus && !isSeller && (
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.8)] dark:border-[#1f2933] dark:bg-[#151e22]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f7f5] dark:bg-[#1A9E8E]/20">
              <i className="pi pi-clock text-[#1A9E8E] dark:text-[#26c9b4]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                Seller Application{" "}
                {sellerStatus === "approved"
                  ? "Approved"
                  : sellerStatus === "rejected"
                    ? "Rejected"
                    : "Pending"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {sellerStatus === "approved"
                  ? "Your application has been approved! You can now access the seller dashboard."
                  : sellerStatus === "rejected"
                    ? "Your application was rejected. Please contact support for more information."
                    : "Your application is being reviewed. You'll be notified once approved."}
              </p>
            </div>
            <Chip
              value={sellerStatus}
              severity={
                sellerStatus === "approved"
                  ? "success"
                  : sellerStatus === "rejected"
                    ? "danger"
                    : "warning"
              }
            />
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        <EditProfileForm
          initialValues={{
            name: profileSummary.name === "-" ? "" : profileSummary.name,
          }}
          loading={updatingProfile}
          onSubmit={handleProfileUpdate}
          onValidationError={setErrorMessage}
        />
      </div>

      <Dialog
        visible={applyDialogVisible}
        onHide={() => {
          setApplyDialogVisible(false);
          setFormErrors({});
        }}
        header="Apply to Become a Seller"
        style={{ width: "650px" }}
        modal
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fill in your business details to start selling on our platform.
            Fields marked with * are required.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <InputText
                name="business_name"
                value={sellerForm.business_name}
                onChange={handleSellerInputChange}
                className={`w-full ${formErrors.business_name ? "p-invalid" : ""}`}
                placeholder="Your business name"
              />
              {formErrors.business_name && (
                <small className="text-red-500">
                  {formErrors.business_name}
                </small>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Business Description
              </label>
              <InputTextarea
                name="business_description"
                value={sellerForm.business_description}
                onChange={handleSellerInputChange}
                rows={3}
                className="w-full"
                placeholder="Describe your business"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Business Address
              </label>
              <InputTextarea
                name="business_address"
                value={sellerForm.business_address}
                onChange={handleSellerInputChange}
                rows={2}
                className="w-full"
                placeholder="Your business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Phone (10 digits)
              </label>
              <InputText
                name="phone"
                value={sellerForm.phone}
                onChange={handleSellerInputChange}
                className={`w-full ${formErrors.phone ? "p-invalid" : ""}`}
                placeholder="1234567890"
                keyfilter="num"
                maxLength={10}
              />
              {formErrors.phone && (
                <small className="text-red-500">{formErrors.phone}</small>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                GST Number
              </label>
              <InputText
                name="gst_number"
                value={sellerForm.gst_number}
                onChange={handleSellerInputChange}
                className={`w-full ${formErrors.gst_number ? "p-invalid" : ""}`}
                placeholder="22AAAAA0000A1Z5"
              />
              {formErrors.gst_number && (
                <small className="text-red-500">{formErrors.gst_number}</small>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Bank Details (Optional)</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Number
                </label>
                <InputText
                  name="bank_account_number"
                  value={sellerForm.bank_account_number}
                  onChange={handleSellerInputChange}
                  className={`w-full ${formErrors.bank_account_number ? "p-invalid" : ""}`}
                  placeholder="123456789012"
                  keyfilter="num"
                />
                {formErrors.bank_account_number && (
                  <small className="text-red-500">
                    {formErrors.bank_account_number}
                  </small>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  IFSC Code
                </label>
                <InputText
                  name="bank_ifsc_code"
                  value={sellerForm.bank_ifsc_code}
                  onChange={handleSellerInputChange}
                  className={`w-full ${formErrors.bank_ifsc_code ? "p-invalid" : ""}`}
                  placeholder="HDFC0001234"
                />
                {formErrors.bank_ifsc_code && (
                  <small className="text-red-500">
                    {formErrors.bank_ifsc_code}
                  </small>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Account Holder Name
                </label>
                <InputText
                  name="bank_account_holder"
                  value={sellerForm.bank_account_holder}
                  onChange={handleSellerInputChange}
                  className={`w-full ${formErrors.bank_account_holder ? "p-invalid" : ""}`}
                  placeholder="Name as per bank records"
                />
                {formErrors.bank_account_holder && (
                  <small className="text-red-500">
                    {formErrors.bank_account_holder}
                  </small>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              label="Cancel"
              text
              onClick={() => {
                setApplyDialogVisible(false);
                setFormErrors({});
              }}
            />
            <Button
              label="Submit Application"
              icon="pi pi-check"
              onClick={handleApplyToBeSeller}
              loading={applying}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default UserProfilePage;
