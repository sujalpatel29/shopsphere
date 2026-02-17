import { useState, useEffect, useCallback, useMemo } from "react";
import { Header } from "./components/ui/Header";
import { Navbar } from "./components/ui/Navbar";
import { SidebarMenu } from "./components/ui/SidebarMenu";
import Footer from "./components/ui/Footer";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import "./styles/App.css";

export default function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const handleThemeToggle = useCallback(() => {
    setIsDarkTheme((prev) => !prev);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarVisible(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarVisible(false);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme);
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  const products = useMemo(() => {
    const productList = [
      { id: 1, name: "Premium Organic Cotton T-Shirt", price: "Rs 899", rating: 4.8 },
      { id: 2, name: "Classic Blue Denim Jeans", price: "Rs 2,499", rating: 4.6 },
      { id: 3, name: "Sustainable Linen Shorts", price: "Rs 1,299", rating: 4.7 },
      { id: 4, name: "Eco-Friendly Summer Dress", price: "Rs 2,199", rating: 4.9 },
      { id: 5, name: "Organic Cotton Polo Shirt", price: "Rs 1,199", rating: 4.5 },
      { id: 6, name: "Recycled Fabric Sports Top", price: "Rs 1,499", rating: 4.8 },
      { id: 7, name: "Premium Linen Blazer", price: "Rs 3,999", rating: 4.7 },
      { id: 8, name: "Sustainable Chinos", price: "Rs 2,099", rating: 4.6 },
    ];
    return productList;
  }, []);

  return (
    <div className="app-container">
      <Header onThemeToggle={handleThemeToggle} isDarkTheme={isDarkTheme} />
      <Navbar onSidebarToggle={openSidebar} />
      <SidebarMenu visible={sidebarVisible} onHide={closeSidebar} />

      <div className="main-content">
        <div className="hero-section">
          <h1 className="hero-title">Curated Essentials</h1>
          <p className="hero-subtitle">Premium quality products designed for modern lifestyles.</p>
          <Button label="Shop Collection" className="hero-btn" />
        </div>

        <div className="products-section">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
          </div>

          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        <div className="newsletter-section">
          <div className="newsletter-content">
            <h2 className="newsletter-title">Join Our Newsletter</h2>
            <p className="newsletter-text">
              Get first access to new arrivals, limited offers, and seasonal edits.
            </p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <InputText type="email" placeholder="Enter your email" className="newsletter-input" required />
              <Button type="submit" label="Subscribe" className="newsletter-btn" />
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProductCard({ product }) {
  const cardHeader = (
    <div className="product-image">
      <i className="pi pi-image"></i>
      <Tag value="New" className="product-badge" />
    </div>
  );

  const cardFooter = (
    <div className="product-buttons">
      <Button icon="pi pi-shopping-cart" label="Add to Cart" className="btn-add-cart" />
      <Button icon="pi pi-heart" className="btn-wishlist" aria-label="Wishlist" />
    </div>
  );

  return (
    <Card className="product-card" header={cardHeader} footer={cardFooter}>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <span>5.0 Stars</span>
          <span>({product.rating})</span>
        </div>
        <div className="product-price">{product.price}</div>
      </div>
    </Card>
  );
}
