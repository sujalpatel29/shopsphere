import React, { useState } from 'react';
import { Button } from "primereact/button";

const categories = [
  { label: 'All Items', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'New Arrivals', value: 'new' },
  { label: 'Sale', value: 'sale' }
];

export function Navbar({ onSidebarToggle }) {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <nav className="navbar-shell sticky top-16 z-40 bg-card border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8 py-3">
        <div className="navbar-row flex items-center gap-3">
          
          {/* Sidebar Toggle */}
          <Button
            onClick={onSidebarToggle}
            className="menu-toggle p-2.5 transition ml-[50px]"
            icon="pi pi-bars navbar-menu-icon"
            aria-label="Toggle menu"
          />

          {/* Categories */}
          <div className="navbar-categories flex-1 overflow-x-auto scrollbar-hide">
            <div className="navbar-items-row flex gap-5 py-0.5">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  onClick={() => setActiveCategory(category.value)}
                  className={`navbar-item px-4 py-2 rounded text-sm font-medium transition whitespace-nowrap ${activeCategory === category.value ? "is-active" : ""}`}
                  label={category.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
