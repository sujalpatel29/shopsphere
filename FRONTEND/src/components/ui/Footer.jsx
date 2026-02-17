import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="footer-shell border-t"
      style={{
        background: "linear-gradient(120deg, var(--primary), var(--secondary))",
        color: "var(--primary-foreground)",
        borderTopColor: "rgba(255,255,255,0.12)",
      }}
    >
      <div className="footer-main px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="footer-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="footer-section">
            <h4 className="footer-heading text-base sm:text-lg font-bold">SHOPMART</h4>
            <p className="footer-brand-copy text-sm opacity-90">
              Elevated essentials and modern apparel curated for quality, comfort, and timeless style.
            </p>
            <div className="footer-socials flex gap-3">
              <Link to="#" className="footer-social-link inline-flex items-center justify-center w-10 h-10 rounded-full transition" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <i className="pi pi-facebook text-sm"></i>
              </Link>
              <Link to="#" className="footer-social-link inline-flex items-center justify-center w-10 h-10 rounded-full transition" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <i className="pi pi-instagram text-sm"></i>
              </Link>
              <Link to="#" className="footer-social-link inline-flex items-center justify-center w-10 h-10 rounded-full transition" style={{ backgroundColor: "rgba(255,255,255,0.12)" }}>
                <i className="pi pi-twitter text-sm"></i>
              </Link>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading text-base sm:text-lg font-bold">Shop</h4>
            <ul className="footer-list text-sm opacity-90">
              <li><Link className="footer-link" to="/category/new">New Arrivals</Link></li>
              <li><Link className="footer-link" to="/category/women">Women</Link></li>
              <li><Link className="footer-link" to="/category/men">Men</Link></li>
              <li><Link className="footer-link" to="/category/accessories">Accessories</Link></li>
              <li><Link className="footer-link" to="/category/sale">Sale</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading text-base sm:text-lg font-bold">Support</h4>
            <ul className="footer-list text-sm opacity-90">
              <li><Link className="footer-link" to="/help">Help Center</Link></li>
              <li><Link className="footer-link" to="/shipping">Shipping and Returns</Link></li>
              <li><Link className="footer-link" to="/track-order">Track Order</Link></li>
              <li><Link className="footer-link" to="/faq">FAQ</Link></li>
              <li><Link className="footer-link" to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading text-base sm:text-lg font-bold">Company</h4>
            <ul className="footer-list text-sm opacity-90">
              <li><Link className="footer-link" to="/about">About</Link></li>
              <li><Link className="footer-link" to="/careers">Careers</Link></li>
              <li><Link className="footer-link" to="/blog">Journal</Link></li>
              <li><Link className="footer-link" to="/privacy">Privacy</Link></li>
              <li><Link className="footer-link" to="/terms">Terms</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom px-4 sm:px-6 lg:px-8 py-5 border-t" style={{ borderTopColor: "rgba(255,255,255,0.12)" }}>
        <div className="footer-bottom-inner max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm opacity-80">
          <span>Copyright {currentYear} Shopmart. All rights reserved.</span>
          <div className="footer-bottom-links flex items-center gap-4">
            <Link className="footer-link" to="/privacy">Privacy</Link>
            <Link className="footer-link" to="/terms">Terms</Link>
            <Link className="footer-link" to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
