import { dashboardPlaceholderContent } from "../constants";
import AddressesSection from "./AddressesSection";
import DashboardLoadingState from "./DashboardLoadingState";
import OffersPage from "./OffersPage";
import OrdersPage from "./OrdersPage";
import PaymentsPage from "./PaymentsPage";
import PlaceholderSection from "./PlaceholderSection";
import UserDashboardHome from "./UserDashboardHome";
import UserProfilePage from "./UserProfilePage";
import UserReviewsPage from "./UserReviewsPage";

function DashboardContent({ currentUser, dashboard }) {
  if (dashboard.loading) {
    return <DashboardLoadingState />;
  }

  if (dashboard.activeTab === "dashboard") {
    return <UserDashboardHome />;
  }

  if (dashboard.activeTab === "profile") {
    return <UserProfilePage currentUser={currentUser} />;
  }

  if (dashboard.activeTab === "orders") {
    return <OrdersPage />;
  }

  if (dashboard.activeTab === "payments") {
    return <PaymentsPage />;
  }

  if (dashboard.activeTab === "addresses") {
    return (
      <AddressesSection
        addresses={dashboard.addresses}
        addressActionError={dashboard.addressActionError}
        addressForm={dashboard.addressForm}
        addressFormError={dashboard.addressFormError}
        addressFormSuccess={dashboard.addressFormSuccess}
        addingAddress={dashboard.addingAddress}
        defaultAddressId={dashboard.defaultAddressId}
        deletingAddressId={dashboard.deletingAddressId}
        loadingEditAddressId={dashboard.loadingEditAddressId}
        onAddAddressChange={dashboard.handleAddressInputChange}
        onAddAddressSubmit={dashboard.handleAddAddress}
        onDeleteAddress={dashboard.handleDeleteAddress}
        onOpenEditAddress={dashboard.handleOpenEditAddress}
        onSetDefaultAddress={dashboard.handleSetDefaultAddress}
        onToggleAddForm={dashboard.toggleAddAddressForm}
        settingDefaultAddressId={dashboard.settingDefaultAddressId}
        showAddAddressForm={dashboard.showAddAddressForm}
      />
    );
  }

  if (dashboard.activeTab === "reviews") {
    return <UserReviewsPage />;
  }

  if (dashboard.activeTab === "wallet") {
    return <OffersPage />;
  }

  const activeContent = dashboardPlaceholderContent[dashboard.activeTab];

  if (!activeContent) {
    return null;
  }

  return (
    <PlaceholderSection title={activeContent.title} text={activeContent.text} />
  );
}

export default DashboardContent;
