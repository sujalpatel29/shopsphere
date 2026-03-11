# Order Pagination Sync Document

## Scope

This document covers the recent pagination and frontend/backend sync work around customer orders and order details.

Main flow:

- Customer order list: `GET /order/user-allorder`
- Customer order items: `GET /order-item/:id/items`
- Customer order summary: `GET /order/order-summery`

## What Changed

### 1. Backend: customer order list now accepts sorting with pagination

File:

- `BACKEND/controllers/Order_master.controller.js`
- `BACKEND/models/Order_master.model.js`

Changes:

- `AllOrder` now reads `page`, `limit`, `sortField`, and `sortOrder` from query params.
- Default paging is still page `1`, limit `5`.
- Maximum limit is capped at `50`.
- Default sorting is `created_at DESC`.
- Response is returned through the shared `paginated(...)` helper so the frontend always receives pagination metadata.

Controller behavior:

- Parses:
  - `page`
  - `limit`
  - `sortField`
  - `sortOrder`
- Calculates `offset = (page - 1) * limit`
- Calls model with sorting parameters
- Returns:
  - `data`
  - `pagination.currentPage`
  - `pagination.itemsPerPage`
  - `pagination.totalItems`
  - `pagination.totalPages`
  - `pagination.hasNextPage`
  - `pagination.hasPrevPage`

Model behavior:

- `getAllOrder(...)` now supports a whitelist for sortable fields:
  - `order_id`
  - `order_number`
  - `order_status`
  - `payment_status`
  - `created_at`
  - `total_amount`
- SQL `ORDER BY` is built only from that whitelist to avoid arbitrary column injection.

### 2. Backend: order summary endpoint was aligned to frontend usage

File:

- `BACKEND/controllers/Order_master.controller.js`

Changes:

- `getOrderSummery` now responds with `ok(...)` and returns:
  - `total_price`
  - `tax`
  - `discount`
  - `shipping`
  - `final_amount`

This is used by the frontend summary component when full order totals are not already passed in.

### 3. Frontend: Redux order slice now sends sorting params

File:

- `FRONTEND/src/redux/slices/orderSlice.js`

Changes:

- `fetchOrders(...)` now accepts:
  - `page`
  - `limit`
  - `sortField`
  - `sortOrder`
- PrimeReact sort values are normalized:
  - `1` -> `ASC`
  - any other value -> `DESC`
- Request format:

```txt
/order/user-allorder?page=1&limit=5&sortField=created_at&sortOrder=DESC
```

- Redux state now stores:
  - `pagination` for the order list
  - `itemPagination` for order items
  - `orderSummery` for fallback pricing summary data

### 4. Frontend: customer order list is now wired to server pagination

File:

- `FRONTEND/src/components/orderComponent.jsx`

Changes:

- Keeps local table state for:
  - `first`
  - `sortField`
  - `sortOrder`
- Initial fetch requests page `1`, limit `5`, sorted by `created_at DESC`
- PrimeReact page events are converted into backend params:
  - `page = Math.floor(event.first / event.rows) + 1`
  - `limit = event.rows`
- PrimeReact sort events now trigger a fresh server fetch from page `1`
- Table uses backend pagination metadata:
  - `pagination.currentPage`
  - `pagination.itemsPerPage`
  - `pagination.totalItems`

Behavioral UI change:

- Clicking an order row now opens an in-page dialog instead of navigating to a nested route.

### 5. Frontend: order detail items are paginated and synced with backend metadata

File:

- `FRONTEND/src/components/OrderDetailComponents.jsx`

Changes:

- Accepts reusable props:
  - `orderId`
  - `orderData`
  - `onClose`
  - `isDialog`
- Falls back to route params or navigation state if props are not supplied
- Calls `findOrderItems({ id, page, limit })`
- Synchronizes PrimeReact `first` with backend response:
  - `itemPagination.currentPage`
  - `itemPagination.itemsPerPage`
- Uses paginator metadata from the backend for the item table

This allows the same component to work both:

- inside the order dialog
- as a route-driven page

### 6. Frontend: order summary component now supports passed data or fetched fallback data

File:

- `FRONTEND/src/components/OrderSummaryComponent.jsx`

Changes:

- Now accepts:
  - `orderData`
  - `title`
- If `orderData` is missing, it dispatches `OrderSummery()`
- It maps backend summary fields into a single display model:
  - subtotal
  - tax
  - discount
  - shipping
  - final total

### 7. Frontend: order page nesting was simplified

Files:

- `FRONTEND/src/pages/OrderPage.jsx`
- `FRONTEND/src/pages/customer/DashboardPage.jsx`

Changes:

- `OrderPage` no longer renders an `Outlet`
- Dashboard hides the generic "Profile Dashboard" card when the active tab is `orders`
- This supports the new dialog-based order details flow cleanly

## API Contract After Changes

### Customer order list request

```http
GET /order/user-allorder?page=1&limit=5&sortField=created_at&sortOrder=DESC
```

### Customer order list response shape

```json
{
  "success": true,
  "message": "Orders found Successfully",
  "data": [],
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 5,
    "totalItems": 0,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Order items request

```http
GET /order-item/:id/items?page=1&limit=5
```

### Order summary request

```http
GET /order/order-summery
```

### Order summary response fields used by frontend

```json
{
  "total_price": 0,
  "tax": 0,
  "discount": 0,
  "shipping": 0,
  "final_amount": 0
}
```

## Files Changed In This Flow

Backend:

- `BACKEND/controllers/Order_master.controller.js`
- `BACKEND/models/Order_master.model.js`

Frontend:

- `FRONTEND/src/redux/slices/orderSlice.js`
- `FRONTEND/src/components/orderComponent.jsx`
- `FRONTEND/src/components/OrderDetailComponents.jsx`
- `FRONTEND/src/components/OrderSummaryComponent.jsx`
- `FRONTEND/src/pages/OrderPage.jsx`
- `FRONTEND/src/pages/customer/DashboardPage.jsx`

## Current Caveats

These are important if you continue this work:

- `FRONTEND/src/components/orderComponent.jsx` still sorts the already-fetched `orders` array locally with `sortedOrders`. That is redundant because the backend is already returning sorted data. Keeping both can cause confusion during future debugging.
- `BACKEND/routes/order_master.route.js` has old admin paginated-order endpoints removed and shows signs of earlier merge cleanup. That is separate from customer order pagination, but it should be reviewed before more admin work is done.
- The thunk and endpoint use the name `OrderSummery` / `order-summery`. It works, but the spelling is inconsistent and should ideally be normalized to `Summary` later.

## Recommended Next Cleanup

1. Remove client-side re-sorting from `orderComponent.jsx` and rely only on server sorting.
2. Review `order_master.route.js` and restore/remove admin endpoints intentionally.
3. Normalize `summary` naming across backend route, controller, thunk, and component.
4. Add a short API note in your backend route docs for allowed `sortField` values.
