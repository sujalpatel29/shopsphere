import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { useToast } from "../../context/ToastContext";
import { getMySellerProfile, updateMySellerProfile } from "../../../api/sellerApi";
import getApiErrorMessage from "../../utils/apiError";
import "../admin/AdminShared.css";

const defaultFormData = {
  business_name: "",
  business_description: "",
  business_address: "",
  phone: "",
  gst_number: "",
  bank_account_number: "",
  bank_ifsc_code: "",
  bank_account_holder: "",
};

function SellerProfileTab() {
  const showToast = useToast();
  const { currentUser } = useSelector((state) => state.auth);
  const outletContext = useOutletContext();
  const reloadSellerProfile = outletContext?.reloadSellerProfile;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getMySellerProfile();
        const data = response.data?.data || null;
        setProfile(data);
        setFormData({
          business_name: data?.business_name || "",
          business_description: data?.business_description || "",
          business_address: data?.business_address || "",
          phone: data?.phone || "",
          gst_number: data?.gst_number || "",
          bank_account_number: data?.bank_account_number || "",
          bank_ifsc_code: data?.bank_ifsc_code || "",
          bank_account_holder: data?.bank_account_holder || "",
        });
      } catch (error) {
        setProfile(null);
        setFormData(defaultFormData);
        showToast("error", "Error", getApiErrorMessage(error, "Failed to load seller profile."));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [showToast]);

  const verificationSeverity = useMemo(() => {
    if (profile?.verification_status === "approved") {
      return "success";
    }
    if (profile?.verification_status === "rejected") {
      return "danger";
    }
    return "warning";
  }, [profile?.verification_status]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      await updateMySellerProfile(formData);
      showToast("success", "Success", "Seller profile updated successfully.");

      const refreshedProfile = await getMySellerProfile();
      setProfile(refreshedProfile.data?.data || null);
      reloadSellerProfile?.();
    } catch (error) {
      showToast("error", "Error", getApiErrorMessage(error, "Failed to update seller profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height="6rem" />
        <Skeleton height="24rem" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">Business Profile</p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
            Seller details and payout setup
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
            Keep your storefront identity and banking information accurate for approval and operations.
          </p>
        </div>
        <Tag
          value={`${profile?.verification_status || "pending"} verification`}
          severity={verificationSeverity}
          className="capitalize"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-2xl border border-gray-100 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business name
                </label>
                <InputText
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="admin-input w-full"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business description
                </label>
                <InputTextarea
                  name="business_description"
                  value={formData.business_description}
                  onChange={handleChange}
                  rows={4}
                  className="admin-input w-full !h-auto"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Business address
                </label>
                <InputTextarea
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  rows={3}
                  className="admin-input w-full !h-auto"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone number
                </label>
                <InputText
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="admin-input w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  GST number
                </label>
                <InputText
                  name="gst_number"
                  value={formData.gst_number}
                  onChange={handleChange}
                  className="admin-input w-full"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
              <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">Payout Details</p>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Account holder
                  </label>
                  <InputText
                    name="bank_account_holder"
                    value={formData.bank_account_holder}
                    onChange={handleChange}
                    className="admin-input w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Account number
                  </label>
                  <InputText
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleChange}
                    className="admin-input w-full"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    IFSC code
                  </label>
                  <InputText
                    name="bank_ifsc_code"
                    value={formData.bank_ifsc_code}
                    onChange={handleChange}
                    className="admin-input w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                label={saving ? "Saving..." : "Save changes"}
                loading={saving}
                className="admin-btn-primary rounded-xl px-5 py-2.5"
              />
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-2xl border border-gray-100 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22]">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">Account</p>
                <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-slate-100">
                  Contact snapshot
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-slate-400">Owner</p>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    {currentUser?.name || "Seller"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    {currentUser?.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-400">Profile status</p>
                  <p className="font-medium capitalize text-gray-900 dark:text-slate-100">
                    {profile?.verification_status || "pending"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border border-gray-100 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22]">
            <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
              <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">Tips</p>
              <div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                Match your business name and GST exactly to the official records used for verification.
              </div>
              <div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                Update payout details before you start processing live orders to avoid operational delays.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SellerProfileTab;
