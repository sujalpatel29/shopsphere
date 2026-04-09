import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  Store,
  XCircle,
} from "lucide-react";
import { getAllSellers, verifySeller } from "../../../api/sellerApi";
import { useToast } from "../../context/ToastContext";
import getApiErrorMessage from "../../utils/apiError";
import "./AdminShared.css";

const statusOptions = [
  { label: "All Status", value: null },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
];

const statusTone = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

function AdminSellersTab() {
  const showToast = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
  const [verifyDialogVisible, setVerifyDialogVisible] = useState(false);
  const [verifyAction, setVerifyAction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSellers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllSellers({
        status: statusFilter,
        search: searchValue || undefined,
      });
      setSellers(response.data?.data || []);
    } catch (error) {
      setSellers([]);
      showToast(
        "error",
        "Error",
        getApiErrorMessage(error, "We could not load seller applications right now."),
      );
    } finally {
      setLoading(false);
    }
  }, [searchValue, showToast, statusFilter]);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  const sellerStats = useMemo(() => {
    const total = sellers.length;
    const pending = sellers.filter(
      (seller) => seller.verification_status === "pending",
    ).length;
    const approved = sellers.filter(
      (seller) => seller.verification_status === "approved",
    ).length;
    const rejected = sellers.filter(
      (seller) => seller.verification_status === "rejected",
    ).length;

    return { total, pending, approved, rejected };
  }, [sellers]);

  const filteredSellers = useMemo(() => {
    const term = searchInput.trim().toLowerCase();
    if (!term) {
      return sellers;
    }

    return sellers.filter((seller) =>
      [
        seller.business_name,
        seller.name,
        seller.email,
        seller.phone,
        seller.gst_number,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [searchInput, sellers]);

  const handleVerify = (seller, action) => {
    setSelectedSeller(seller);
    setVerifyAction(action);
    setVerifyDialogVisible(true);
  };

  const handleConfirmVerify = async () => {
    if (!selectedSeller || !verifyAction) {
      return;
    }

    try {
      setSubmitting(true);
      await verifySeller(selectedSeller.seller_id, verifyAction);
      showToast(
        "success",
        "Success",
        `Seller ${verifyAction === "approved" ? "approved" : "rejected"} successfully.`,
      );
      setVerifyDialogVisible(false);
      setSelectedSeller(null);
      setVerifyAction(null);
      await loadSellers();
    } catch (error) {
      showToast(
        "error",
        "Error",
        getApiErrorMessage(error, "Failed to update seller verification status."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const businessTemplate = (rowData) => (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 dark:text-slate-100">
        {rowData.business_name}
      </span>
      <span className="text-xs text-gray-500 dark:text-slate-400">
        Seller ID #{rowData.seller_id}
      </span>
    </div>
  );

  const ownerTemplate = (rowData) => (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 dark:text-slate-100">
        {rowData.name}
      </span>
      <span className="text-xs text-gray-500 dark:text-slate-400">
        {rowData.email}
      </span>
    </div>
  );

  const statusTemplate = (rowData) => (
    <Tag
      value={rowData.verification_status || "pending"}
      severity={statusTone[rowData.verification_status] || "secondary"}
      className="capitalize"
    />
  );

  const dateTemplate = (rowData) =>
    rowData.created_at
      ? new Date(rowData.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const actionsTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        type="button"
        rounded
        text
        className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
        onClick={() => {
          setSelectedSeller(rowData);
          setDetailsDialogVisible(true);
        }}
        tooltip="View seller details"
        tooltipOptions={{ position: "top" }}
      >
        <Store className="h-4 w-4" />
      </Button>

      {rowData.verification_status === "pending" ? (
        <>
          <Button
            type="button"
            rounded
            text
            severity="success"
            className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
            onClick={() => handleVerify(rowData, "approved")}
            tooltip="Approve seller"
            tooltipOptions={{ position: "top" }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            rounded
            text
            severity="danger"
            className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
            onClick={() => handleVerify(rowData, "rejected")}
            tooltip="Reject seller"
            tooltipOptions={{ position: "top" }}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </>
      ) : null}
    </div>
  );

  const statsCards = [
    {
      label: "Total Sellers",
      count: sellerStats.total,
      icon: <Store size={22} className="text-[#2a6857]" />,
    },
    {
      label: "Pending Review",
      count: sellerStats.pending,
      icon: <Clock3 size={22} className="text-amber-500" />,
    },
    {
      label: "Approved",
      count: sellerStats.approved,
      icon: <ShieldCheck size={22} className="text-emerald-500" />,
    },
    {
      label: "Rejected",
      count: sellerStats.rejected,
      icon: <XCircle size={22} className="text-rose-500" />,
    },
  ];

  return (
    <div className="admin-products-container animate-fade-in flex-1 flex flex-col min-h-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {statsCards.map((item) => (
          <Card key={item.label} className="!p-0">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted mb-1">{item.label}</p>
                <p className="text-2xl font-bold leading-none">{item.count}</p>
              </div>
              {item.icon}
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        Seller profiles are reviewed here. Admin can approve or reject applications, but seller business details remain seller-managed once approved.
      </div>

      <div className="admin-products-card flex-1 flex flex-col min-h-0">
        <div className="admin-products-toolbar mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-[#b08d57]">
              Marketplace Sellers
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
              Seller approvals
            </h3>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Dropdown
              value={statusFilter}
              options={statusOptions}
              onChange={(e) => setStatusFilter(e.value)}
              placeholder="Filter by status"
              className="admin-filter-dropdown w-full sm:w-44"
              pt={{
                root: {
                  className:
                    "admin-dropdown-root rounded-xl h-10 flex items-center shadow-none border border-gray-200 dark:border-gray-700",
                },
                input: { className: "px-3 text-sm" },
                trigger: { className: "w-8" },
                panel: {
                  className: "admin-dropdown-panel rounded-lg shadow-xl mt-1",
                },
              }}
            />

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <InputText
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search sellers..."
                className="admin-search-input w-full pl-10 border border-gray-200 dark:border-gray-700 rounded-xl h-10 text-sm transition-all outline-none"
              />
            </div>

            <Button
              type="button"
              icon="pi pi-refresh"
              outlined
              onClick={loadSellers}
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="admin-products-table-wrapper flex-1 flex flex-col min-h-0">
          <DataTable
            value={
              loading
                ? Array.from({ length: 6 }, (_, index) => ({
                    seller_id: `skeleton-${index}`,
                  }))
                : filteredSellers
            }
            loading={loading}
            scrollable
            scrollHeight="calc(100vh - 20rem)"
            paginator
            rows={10}
            rowsPerPageOptions={[10, 25, 50]}
            emptyMessage="No seller applications found."
            className="admin-products-table"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          >
            <Column
              header="Business"
              field="business_name"
              sortable
              body={loading ? () => <Skeleton width="9rem" height="1.2rem" /> : businessTemplate}
              style={{ minWidth: "14rem" }}
            />
            <Column
              header="Owner"
              field="name"
              sortable
              body={loading ? () => <Skeleton width="10rem" height="1.2rem" /> : ownerTemplate}
              style={{ minWidth: "14rem" }}
            />
            <Column
              header="Phone"
              field="phone"
              body={loading ? () => <Skeleton width="7rem" height="1.2rem" /> : null}
              style={{ minWidth: "9rem" }}
            />
            <Column
              header="GST"
              field="gst_number"
              body={loading ? () => <Skeleton width="7rem" height="1.2rem" /> : null}
              style={{ minWidth: "10rem" }}
            />
            <Column
              header="Status"
              field="verification_status"
              sortable
              body={loading ? () => <Skeleton width="6rem" height="1.8rem" /> : statusTemplate}
              style={{ minWidth: "8rem" }}
            />
            <Column
              header="Applied On"
              field="created_at"
              sortable
              body={loading ? () => <Skeleton width="7rem" height="1.2rem" /> : dateTemplate}
              style={{ minWidth: "9rem" }}
            />
            <Column
              header="Actions"
              body={loading ? () => <Skeleton width="6rem" height="2rem" /> : actionsTemplate}
              style={{ minWidth: "9rem" }}
            />
          </DataTable>
        </div>
      </div>

      <Dialog
        visible={detailsDialogVisible}
        onHide={() => setDetailsDialogVisible(false)}
        header="Seller Details"
        style={{ width: "760px", maxWidth: "96vw" }}
        modal
        pt={{
          root: {
            className:
              "border-0 shadow-2xl rounded-2xl overflow-hidden admin-dialog",
          },
          header: {
            className: "admin-dialog-header px-6 py-4 border-b",
          },
          content: { className: "p-6" },
        }}
      >
        {selectedSeller ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#f5f0e8] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Business
                </p>
                <p className="mt-3 font-semibold text-gray-900 dark:text-slate-100">
                  {selectedSeller.business_name}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f5f0e8] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Status
                </p>
                <div className="mt-3">
                  <Tag
                    value={selectedSeller.verification_status}
                    severity={
                      statusTone[selectedSeller.verification_status] || "secondary"
                    }
                    className="capitalize"
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-[#f5f0e8] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Applicant
                </p>
                <p className="mt-3 font-semibold text-gray-900 dark:text-slate-100">
                  {selectedSeller.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {selectedSeller.email}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Business Description
                </p>
                <p className="mt-3 text-sm text-gray-700 dark:text-slate-200">
                  {selectedSeller.business_description || "No business description provided."}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Business Address
                </p>
                <p className="mt-3 text-sm text-gray-700 dark:text-slate-200">
                  {selectedSeller.business_address || "No business address provided."}
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Contact Details
                </p>
                <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-slate-200">
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {selectedSeller.phone || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold">GST:</span>{" "}
                    {selectedSeller.gst_number || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Bank Details
                </p>
                <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-slate-200">
                  <p>
                    <span className="font-semibold">Account Holder:</span>{" "}
                    {selectedSeller.bank_account_holder || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold">Account:</span>{" "}
                    {selectedSeller.bank_account_number
                      ? `****${selectedSeller.bank_account_number.slice(-4)}`
                      : "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold">IFSC:</span>{" "}
                    {selectedSeller.bank_ifsc_code || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        visible={verifyDialogVisible}
        onHide={() => setVerifyDialogVisible(false)}
        header={verifyAction === "approved" ? "Approve Seller" : "Reject Seller"}
        style={{ width: "440px", maxWidth: "94vw" }}
        modal
        pt={{
          root: {
            className:
              "border-0 shadow-2xl rounded-2xl overflow-hidden admin-dialog",
          },
          header: {
            className: "admin-dialog-header px-6 py-4 border-b",
          },
          content: { className: "p-6" },
        }}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-slate-300">
              You are about to{" "}
              <span className="font-semibold text-gray-900 dark:text-slate-100">
                {verifyAction}
              </span>{" "}
              this seller application.
            </p>
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-slate-100">
              {selectedSeller?.business_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {selectedSeller?.email}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              label="Cancel"
              onClick={() => setVerifyDialogVisible(false)}
              disabled={submitting}
              className="admin-btn-secondary px-4 py-2 rounded-lg font-medium transition-colors"
              pt={{ root: { className: "border-none bg-transparent" } }}
            />
            <Button
              type="button"
              label={
                verifyAction === "approved"
                  ? submitting
                    ? "Approving..."
                    : "Approve"
                  : submitting
                    ? "Rejecting..."
                    : "Reject"
              }
              severity={verifyAction === "approved" ? "success" : "danger"}
              onClick={handleConfirmVerify}
              loading={submitting}
              className="admin-btn-primary px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default AdminSellersTab;
