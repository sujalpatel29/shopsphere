import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { useSelector } from "react-redux";
import DashboardContent from "./dashboard/components/DashboardContent";
import DashboardSidebar from "./dashboard/components/DashboardSidebar";
import EditAddressDialog from "./dashboard/components/EditAddressDialog";
import OrderDetailsDialog from "./dashboard/components/OrderDetailsDialog";
import { profileNav } from "./dashboard/constants";
import { useCustomerDashboard } from "./dashboard/useCustomerDashboard";

function DashboardPage() {
  const { currentUser } = useSelector((state) => state.auth);
  const dashboard = useCustomerDashboard();
  const toastRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem("customer-sidebar-open");
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((previous) => {
      const next = !previous;

      try {
        localStorage.setItem("customer-sidebar-open", String(next));
      } catch {
        // Ignore localStorage failures to keep UI responsive.
      }

      return next;
    });
  }, []);

  const activeLabel = useMemo(
    () =>
      profileNav.find((tab) => tab.key === dashboard.activeTab)?.label ||
      "Dashboard",
    [dashboard.activeTab],
  );

  const showToast = useCallback((severity, summary, detail) => {
    if (!detail) {
      return;
    }

    toastRef.current?.show({ severity, summary, detail, life: 3000 });
  }, []);

  useEffect(() => {
    document.body.classList.add("dashboard-toast-only");

    return () => {
      document.body.classList.remove("dashboard-toast-only");
    };
  }, []);

  return (
    <div
      className={`admin-dashboard-grid grid items-start gap-6 p-6 ${
        sidebarOpen ? "lg:grid-cols-[290px_1fr]" : "lg:grid-cols-1"
      }`}
    >
      <DashboardSidebar
        currentUser={dashboard.profile || currentUser}
        activeTab={dashboard.activeTab}
        loading={dashboard.loading}
        onRefresh={dashboard.loadDashboardData}
        onTabChange={dashboard.setActiveTab}
        sidebarOpen={sidebarOpen}
      />

      <section className="min-w-[0] min-h-0 h-full">
        <Card
          className="rounded-2xl border border-gray-100 bg-white pt-6 px-6 pb-1 dark:border-[#1f2933] dark:bg-[#151e22] shadow-sm h-full overflow-hidden"
          pt={{
            body: { className: "p-0 h-full flex flex-col" },
            content: { className: "p-0 flex-1 flex flex-col min-h-0" },
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <Button
              type="button"
              onClick={toggleSidebar}
              className="!hidden lg:!flex !items-center !justify-center !w-9 !h-9 !p-0 !rounded-lg !shadow-none !bg-transparent !text-gray-500 hover:!bg-gray-100 hover:!text-gray-700 dark:!text-gray-400 dark:hover:!bg-gray-800 dark:hover:!text-gray-200 !transition-colors !border-none"
              tooltip={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              tooltipOptions={{ position: "right" }}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
            <div>
              <h3 className="font-serif text-2xl text-gray-900 dark:text-slate-100">
                {activeLabel}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                Manage {activeLabel.toLowerCase()} here.
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pb-6">
            <DashboardContent
              currentUser={dashboard.profile || currentUser}
              dashboard={dashboard}
              showToast={showToast}
            />
          </div>
        </Card>
      </section>

      <Toast
        ref={toastRef}
        position="top-right"
        baseZIndex={13000}
        className="customer-dashboard-toast"
      />

      <OrderDetailsDialog
        visible={dashboard.orderItemsDialogVisible}
        selectedOrder={dashboard.selectedOrder}
        selectedOrderItems={dashboard.selectedOrderItems}
        loading={dashboard.orderItemsLoading}
        error={dashboard.orderItemsError}
        onHide={dashboard.handleCloseOrderDetails}
      />

      <EditAddressDialog
        visible={dashboard.editAddressDialogVisible}
        form={dashboard.editAddressForm}
        updating={dashboard.updatingAddress}
        addressFormError={dashboard.addressFormError}
        addressActionError={dashboard.addressActionError}
        onHide={dashboard.closeEditAddressDialog}
        onChange={dashboard.handleEditAddressInputChange}
        onSubmit={dashboard.handleUpdateAddress}
      />
    </div>
  );
}

export default DashboardPage;
