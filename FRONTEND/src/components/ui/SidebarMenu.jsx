import { Sidebar } from "primereact/sidebar";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export function SidebarMenu({ visible, onHide }) {
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    onHide();
  };

  const categories = [
    { label: "Women's", icon: "pi pi-female", path: "/category/womens" },
    { label: "Men's", icon: "pi pi-male", path: "/category/mens" },
    { label: "Accessories", icon: "pi pi-gift", path: "/category/accessories" },
    { label: "Sale", icon: "pi pi-tag", path: "/category/sale" },
  ];

  const collections = [
    { label: "New Arrivals", icon: "pi pi-inbox", path: "/collections/new" },
    { label: "Bestsellers", icon: "pi pi-star-fill", path: "/collections/bestsellers" },
    { label: "Limited Edition", icon: "pi pi-lock", path: "/collections/limited" },
  ];

  const support = [
    { label: "Help Center", icon: "pi pi-question-circle", path: "/help" },
    { label: "Track Order", icon: "pi pi-truck", path: "/track-order" },
    { label: "Returns", icon: "pi pi-arrow-left", path: "/returns" },
    { label: "Contact", icon: "pi pi-envelope", path: "/contact" },
  ];

  const sections = [
    { title: "Categories", items: categories },
    { title: "Featured Collections", items: collections },
    { title: "Customer Care", items: support },
  ];

  const menuItem = (item) => (
    <Button
      onClick={() => goTo(item.path)}
      className="sidebar-menu-item w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
      icon={item.icon}
      label={item.label}
      iconPos="left"
    >
    </Button>
  );

  return (
    <Sidebar
      visible={visible}
      onHide={onHide}
      showCloseIcon={false}
      className="sidebar-menu w-full sm:w-72"
      header={
        <div className="sidebar-menu-header flex items-center justify-between px-4 py-3 rounded-b-lg">
          <div className="flex items-center gap-2">
            <i className="pi pi-bars text-lg"></i>
            <div className="sidebar-menu-header-text">
              <span className="sidebar-menu-title block">Navigation</span>
              <span className="sidebar-menu-subtitle">Browse sections</span>
            </div>
          </div>
          <Button icon="pi pi-times" className="sidebar-menu-close" onClick={onHide} aria-label="Close menu" />
        </div>
      }
    >
      <div className="sidebar-menu-content pb-4">
        {sections.map((section, index) => (
          <div key={section.title} className="sidebar-menu-section">
            <h3 className="sidebar-menu-section-title px-3">
              {section.title}
            </h3>
            <div className="sidebar-menu-list space-y-1">
              {section.items.map((item) => (
                <div key={item.path}>{menuItem(item)}</div>
              ))}
            </div>
            {index < sections.length - 1 && <Divider className="sidebar-menu-divider" />}
          </div>
        ))}

        <Divider className="sidebar-menu-divider" />
        <div className="sidebar-menu-section">
          <h3 className="sidebar-menu-section-title px-3">
            Quick Access
          </h3>
          <div className="sidebar-menu-list space-y-1">
            {menuItem({ label: "About Us", icon: "pi pi-building", path: "/about" })}
            {menuItem({ label: "Blog", icon: "pi pi-book", path: "/blog" })}
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
