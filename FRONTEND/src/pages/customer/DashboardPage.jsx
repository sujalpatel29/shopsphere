import { useSelector } from "react-redux";
import DashboardContent from "./dashboard/components/DashboardContent";
import DashboardHeader from "./dashboard/components/DashboardHeader";
import DashboardSidebar from "./dashboard/components/DashboardSidebar";
import EditAddressDialog from "./dashboard/components/EditAddressDialog";
import OrderDetailsDialog from "./dashboard/components/OrderDetailsDialog";
import { useCustomerDashboard } from "./dashboard/useCustomerDashboard";

function DashboardPage() {
  const { currentUser } = useSelector((state) => state.auth);
  const dashboard = useCustomerDashboard();

  return (
    <div className="grid items-start gap-4 lg:gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
      <DashboardSidebar
        currentUser={currentUser}
        activeTab={dashboard.activeTab}
        loading={dashboard.loading}
        onRefresh={dashboard.loadDashboardData}
        onTabChange={dashboard.setActiveTab}
      />

      <section className="min-w-0 space-y-4">
        <DashboardHeader error={dashboard.error} />
        <DashboardContent currentUser={currentUser} dashboard={dashboard} />
      </section>

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
