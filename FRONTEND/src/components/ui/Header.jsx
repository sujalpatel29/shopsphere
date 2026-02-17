import "../../styles/header.css";
import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

export function Header({ onThemeToggle, isDarkTheme }) {
  const [cartCount] = useState(3);

  return (
    <header
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--primary-foreground)",
      }}
      className="sticky top-0 z-50 shadow-md"
    >
      <div className="px-0 py-4 w-full">
        <div className="hidden lg:grid grid-cols-[auto_1fr_auto] items-center gap-8">
          <div className="logo text-xl font-semibold whitespace-nowrap">SHOPMART</div>

          <div className="flex justify-center">
            <div className="flex items-center w-full max-w-xl gap-2">
              <InputText
                type="text"
                placeholder="Search for products..."
                className="search-bar flex-1"
              />
              <Button icon="pi pi-search" className="search-btn btn-uniform" aria-label="Search" />
            </div>
          </div>

          <div className="flex items-center gap-6 justify-end">
            <Button
              onClick={onThemeToggle}
              icon={`pi ${isDarkTheme ? "pi-sun" : "pi-moon"}`}
              className="header-btn btn-uniform"
              aria-label="Toggle theme"
            />

            <div className="cart-wrapper">
              <Button icon="pi pi-shopping-cart" className="header-btn btn-uniform relative" aria-label="Cart">
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Button>
            </div>

            <Button icon="pi pi-user" label="Account" className="header-btn btn-account" aria-label="Account" />
          </div>
        </div>

        <div className="lg:hidden flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="logo text-lg font-semibold">SHOPMART</div>

            <div className="flex items-center gap-3">
              <Button
                onClick={onThemeToggle}
                icon={`pi ${isDarkTheme ? "pi-sun" : "pi-moon"}`}
                className="header-btn btn-uniform"
                aria-label="Toggle theme"
              />

              <Button icon="pi pi-shopping-cart" className="header-btn btn-uniform relative" aria-label="Cart">
                {cartCount > 0 && <span className="cart-count text-xs">{cartCount}</span>}
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <InputText type="text" placeholder="Search..." className="search-bar flex-1" />
            <Button icon="pi pi-search" className="search-btn btn-uniform" aria-label="Search" />
          </div>
        </div>
      </div>
    </header>
  );
}
