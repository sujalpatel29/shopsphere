import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { ScrollPanel } from "primereact/scrollpanel";
import {
  BarChart3,
  LogOut,
  Moon,
  Package,
  PanelLeft,
  PanelLeftClose,
  ShoppingCart,
  Store,
  Sun,
  User,
} from "lucide-react";
import { logoutUser } from "../../redux/slices/authSlice";
import { useTheme } from "../../context/ThemeContext";
import { getMySellerProfile } from "../../../api/sellerApi";
import "../../pages/admin/AdminShared.css";

const sellerNav = [
  { label: "Overview", to: "/seller/dashboard", icon: BarChart3 },
  { label: "Products", to: "/seller/products", icon: Package },
  { label: "Orders", to: "/seller/orders", icon: ShoppingCart },
  { label: "Profile", to: "/seller/profile", icon: User },
];

function SellerSidebar({
  currentUser,
  darkMode,
  toggleDarkMode,
  onLogout,
  location,
  navigate,
  sellerProfile,
  loadingProfile,
}) {
  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-[#163332] px-6 py-8 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2">
            <img src="/logo.svg" alt="ShopSphere" className="h-10 w-10" />
            <span className="font-serif text-2xl font-semibold tracking-tight">
              ShopSphere
            </span>
          </div>
          <p className="font-serif text-xs font-medium tracking-[0.2em] text-[#c9b88a]">
            SELLER STUDIO
          </p>
          <h1
            className="mt-2 w-full truncate text-lg font-medium tracking-tight text-white/85"
            title={currentUser?.email}
          >
            {sellerProfile?.business_name || currentUser?.name || currentUser?.email}
          </h1>
          <p className="mt-1 text-xs text-white/60">{currentUser?.email}</p>
          <div className="mt-4 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium capitalize text-[#f7edcf]">
            {loadingProfile
              ? "Loading status..."
              : `${sellerProfile?.verification_status || "pending"} seller`}
          </div>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-1 overflow-y-auto min-h-0">
        {sellerNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Button
              key={item.to}
              type="button"
              onClick={() => navigate(item.to)}
              className={`!flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none ${
                isActive
                  ? "!bg-amber-600 !text-white !shadow-lg !shadow-amber-600/20"
                  : "!bg-transparent !text-gray-700 hover:!bg-amber-50 hover:!text-amber-700 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button
          type="button"
          onClick={toggleDarkMode}
          className="!flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none !bg-transparent !text-gray-700 hover:!bg-amber-50 hover:!text-amber-700 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Button>
        <Button
          type="button"
          onClick={onLogout}
          className="!flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none !bg-transparent !text-red-600 hover:!bg-red-50 dark:!text-red-400 dark:hover:!bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );
}

function SellerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);
  const { darkMode, toggleDarkMode } = useTheme();
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentView = useMemo(() => {
    return sellerNav.find((item) => item.to === location.pathname)?.label || "Seller";
  }, [location.pathname]);

  const loadSellerProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const response = await getMySellerProfile();
      setSellerProfile(response.data?.data || null);
    } catch (error) {
      setSellerProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    loadSellerProfile();
  }, [loadSellerProfile]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    navigate("/login");
  }, [dispatch, navigate]);

  if (!currentUser || currentUser.role !== "seller") {
    return <Navigate to="/dashboard" replace />;
  }

  const verificationStatus = sellerProfile?.verification_status || "pending";
  const bannerTone =
    verificationStatus === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
      : verificationStatus === "rejected"
        ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden font-sans ${
        darkMode ? "bg-[#0b1114] text-slate-200" : "bg-gray-50 text-gray-900"
      }`}
    >
      <ScrollPanel className="app-scrollpanel flex-1" style={{ width: "100%", height: "100%" }}>
        <main className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-8 lg:px-12">
          {sellerProfile && (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${bannerTone}`}>
              {verificationStatus === "approved"
                ? "Your seller account is approved and live. You can manage your catalog and review incoming orders."
                : verificationStatus === "rejected"
                  ? "Your seller account was rejected. Update your business details and contact the admin team before continuing."
                  : "Your seller account is pending approval. You can prepare your profile and catalog while verification is in progress."}
            </div>
          )}

          <div
            className={`admin-dashboard-grid grid items-start gap-6 ${
              sidebarOpen ? "lg:grid-cols-[290px_1fr]" : "lg:grid-cols-1"
            }`}
          >
            <div
              className={`hidden max-h-[calc(100vh-3rem)] overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 transition-all duration-300 dark:border-[#1f2933] dark:bg-[#151e22] lg:flex lg:sticky lg:top-6 lg:flex-col ${
                sidebarOpen ? "opacity-100" : "lg:hidden"
              }`}
            >
              <SellerSidebar
                currentUser={currentUser}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onLogout={handleLogout}
                location={location}
                navigate={navigate}
                sellerProfile={sellerProfile}
                loadingProfile={loadingProfile}
              />
            </div>

            <section className="min-w-0 min-h-0">
              <Card
                className="h-full overflow-hidden rounded-2xl border border-gray-100 bg-white px-6 pb-1 pt-6 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22]"
                pt={{
                  body: { className: "p-0 h-full flex flex-col" },
                  content: { className: "p-0 flex-1 flex flex-col min-h-0 overflow-y-auto" },
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setMobileSidebarOpen((prev) => !prev)}
                    className="!flex lg:!hidden !items-center !justify-center !w-9 !h-9 !p-0 !rounded-lg !shadow-none !bg-transparent !text-gray-500 hover:!bg-gray-100 hover:!text-gray-700 dark:!text-gray-400 dark:hover:!bg-gray-800 dark:hover:!text-gray-200 !border-none"
                  >
                    {mobileSidebarOpen ? (
                      <PanelLeftClose className="h-5 w-5" />
                    ) : (
                      <PanelLeft className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setSidebarOpen((prev) => !prev)}
                    className="!hidden lg:!flex !items-center !justify-center !w-9 !h-9 !p-0 !rounded-lg !shadow-none !bg-transparent !text-gray-500 hover:!bg-gray-100 hover:!text-gray-700 dark:!text-gray-400 dark:hover:!bg-gray-800 dark:hover:!text-gray-200 !border-none"
                  >
                    {sidebarOpen ? (
                      <PanelLeftClose className="h-5 w-5" />
                    ) : (
                      <PanelLeft className="h-5 w-5" />
                    )}
                  </Button>
                  <div>
                    <h3 className="font-serif text-2xl text-gray-900 dark:text-slate-100">
                      {currentView}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
                      Manage your store operations, orders, and business details.
                    </p>
                  </div>
                </div>

                {loadingProfile && !sellerProfile ? (
                  <div className="space-y-4">
                    <Skeleton height="3rem" />
                    <Skeleton height="18rem" />
                  </div>
                ) : (
                  <Outlet context={{ sellerProfile, reloadSellerProfile: loadSellerProfile }} />
                )}
              </Card>
            </section>
          </div>

          {mobileSidebarOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu overlay"
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 z-[1100] bg-black/40 lg:hidden"
              />
              <div className="fixed inset-y-0 left-0 z-[1110] w-[300px] max-w-[88vw] p-3 lg:hidden">
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-xl dark:border-[#1f2933] dark:bg-[#151e22]">
                  <SellerSidebar
                    currentUser={currentUser}
                    darkMode={darkMode}
                    toggleDarkMode={toggleDarkMode}
                    onLogout={handleLogout}
                    location={location}
                    navigate={navigate}
                    sellerProfile={sellerProfile}
                    loadingProfile={loadingProfile}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </ScrollPanel>
    </div>
  );
}

export default SellerLayout;
