# Changelog

---

## [cb5e02c] — 2026-03-10

**Branch:** `Milan_Payment_Master`
**Commit:** `refactor: centralize toast notifications into ToastContext and add admin orders tab`

---

### New Files

#### `FRONTEND/src/context/ToastContext.jsx`
- Created a global React context for PrimeReact toast notifications.
- Exports `ToastProvider` (mounts a single `<Toast>` at the app root) and `useToast()` hook.
- Any component anywhere in the tree can call `const showToast = useToast()` instead of managing its own `<Toast>` ref.

#### `FRONTEND/src/pages/admin/AdminOrdersTab.jsx`
- New admin tab for managing customer orders.
- Server-side pagination, search, multi-filter (order status, payment status, payment method, date range).
- Stats bar showing order counts by status.
- Opens `OrderDetailModal` on row click; refreshes list only when a mutation occurred inside the modal.

#### `FRONTEND/src/pages/admin/OrdersTable.jsx`
- PrimeReact `DataTable` displaying orders with lazy loading, sorting, and pagination.
- Columns: Order ID, customer, items, total amount, order status, payment status, payment method, date.
- Status badges with color coding.

#### `FRONTEND/src/pages/admin/OrdersToolbar.jsx`
- Search input, filter dropdowns (order status, payment status, payment method, date range), and stats chips.

#### `FRONTEND/src/pages/admin/OrderDetailModal.jsx`
- Full-screen dialog showing a single order in detail.
- Tabs: Overview (customer info, timeline), Items (product list with portions/modifiers), Payment.
- Admin can update order status and payment status from this modal.
- Fires `onMutate` callback to parent so the orders list refreshes on close if anything changed.

#### `FRONTEND/api/adminOrdersApi.js`
- API module for the orders admin endpoints.
- `fetchAdminOrders({ page, limit, search, sortField, sortOrder, orderStatus, paymentStatus, paymentMethod, dateFrom, dateTo })` — server-side paginated list with stats.
- `fetchAdminOrderDetail(orderId)` — single order with all nested data.
- `updateAdminOrderStatus(orderId, status)` — patch order status.
- `updateAdminPaymentStatus(orderId, status)` — patch payment status.

#### `FRONTEND/src/components/common/SmartImage.jsx`
- Reusable image component with lazy loading, Cloudinary URL transform support, error fallback, and loading spinner.

#### `FRONTEND/src/utils/apiError.js`
- Utility `getApiErrorMessage(error, fallback)` — extracts a human-readable error message from Axios error responses (handles validation arrays, string messages, network errors).

#### `FRONTEND/src/utils/image.js`
- Cloudinary URL helpers: `buildCloudinaryUrl(url, transforms)` for generating optimized image URLs with width/quality transforms.

---

### Modified Files

#### `FRONTEND/src/App.jsx`
- Wrapped `<AppRoutes>` inside `<ToastProvider>` so the global toast is available throughout the app.

#### `FRONTEND/src/pages/admin/AdminDashboardPage.jsx`
- Added **Orders** tab to the admin dashboard tab view alongside Products, Portions, and Modifiers.
- Renders `<AdminOrdersTab>` in the new tab panel.

#### `FRONTEND/src/pages/admin/AdminModifiersTab.jsx`
- **Removed:** local `useRef` for toast, `const toast = useRef(null)`, `showToast` useCallback, `<Toast ref={toast} position="top-right" />`.
- **Added:** `import { useToast }` from ToastContext, `const showToast = useToast()`.

#### `FRONTEND/src/pages/admin/AdminPortionsTab.jsx`
- Same toast refactor as `AdminModifiersTab`.

#### `FRONTEND/src/pages/admin/AdminProductsTab.jsx`
- Same toast refactor (removed per-component toast setup).
- Also received minor enhancements to product creation flow and status toggle optimistic updates.

#### `FRONTEND/src/pages/admin/AdminProductsTable.jsx`
- UI improvements and column adjustments for the products table.

#### `FRONTEND/src/pages/admin/AdminProductsToolbar.jsx`
- Minor adjustments to toolbar layout.

#### `FRONTEND/src/pages/admin/AdminProducts.css`
- Extended with new CSS classes to support the Orders tab, order status badges, and SmartImage styles.

#### `FRONTEND/src/pages/admin/ProductFormModal.jsx`
- **Removed:** `import { Toast }`, `const panelToast = useRef(null)`, `showToast` useCallback using `panelToast`, `<Toast ref={panelToast} position="top-right" />`.
- **Removed:** `showToast={showToast}` prop passed down to `ProductPortionsPanel`, `ProductModifiersPanel`, `ProductImagesPanel`.
- **Added:** `import { useToast }`, `const showToast = useToast()`.
- `useRef` kept for `filePickerGuardTimerRef` (unrelated to toast).

#### `FRONTEND/src/pages/admin/ProductImagesPanel.jsx`
- **Removed:** `showToast` from props and JSDoc.
- **Added:** `useToast()` called directly inside component.
- Uses new `SmartImage` component for thumbnails.
- Uses `buildCloudinaryUrl` from `utils/image.js` for optimized image URLs.

#### `FRONTEND/src/pages/admin/ProductModifiersPanel.jsx`
- Same prop-drilling removal as `ProductImagesPanel`; now calls `useToast()` directly.

#### `FRONTEND/src/pages/admin/ProductPortionsPanel.jsx`
- Same prop-drilling removal; now calls `useToast()` directly.

#### `FRONTEND/src/pages/LoginPage.jsx` / `RegisterPage.jsx`
- Minor auth flow updates.

#### `FRONTEND/src/pages/customer/HomePage.jsx`
- Minor customer-facing updates.

#### `FRONTEND/src/redux/slices/authSlice.js`
- Minor auth state updates.

#### `FRONTEND/api/adminProductImagesApi.js`
- Added missing API methods for image update and delete operations.

#### `BACKEND/models/product.model.js`
- Model adjustments (associations / query updates).

#### `BACKEND/models/productImage.model.js`
- Model adjustments.

---

### Architecture Change: Centralized Toast

**Before:**
- Every admin component owned its own `<Toast>` instance.
- Each file imported `Toast` from PrimeReact, created a `useRef`, wrote a `showToast` useCallback, and mounted `<Toast ref={...} position="top-right" />` in JSX.
- Child panels (`ProductImagesPanel`, `ProductModifiersPanel`, `ProductPortionsPanel`) received `showToast` as a prop from `ProductFormModal`.

**After:**
- One `<Toast>` mounted globally inside `ToastProvider` in `App.jsx`.
- Every component calls `const showToast = useToast()` — one line, no local setup.
- No prop drilling for toast in any component.

---

### Stats

| Metric | Value |
|---|---|
| Files changed | 45 |
| Lines added | +3,439 |
| Lines removed | -888 |
| New source files | 7 |
| Components refactored (toast) | 9 |
