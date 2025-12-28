# Table Ordering & Kitchen Display System

## Overview

Complete table-based ordering system where customers can scan QR codes to order directly from their table, and chefs can view orders in real-time on a kitchen display system.

## Features

### Customer Experience (`/menu/[table]`)

- Scan QR code or visit direct link (e.g., `/menu/T1`)
- Browse menu with category filters
- Add items to cart with quantities
- Add special instructions per item
- Add general order notes
- View cart with total
- Submit order directly to kitchen
- No login required

### Kitchen Display System (`/chef/kitchen`)

- Real-time order display
- Three-column Kanban layout:
  - **Pending** - New orders waiting to be started
  - **Preparing** - Orders currently being cooked
  - **Ready** - Orders ready for serving
- Auto-refresh every 10 seconds
- Time elapsed since order placed
- Visual status indicators
- One-click status updates
- Dark theme optimized for kitchen environment

### Admin QR Code Generator (`/admin/qr-codes`)

- Generate QR codes for all tables
- Preview QR codes
- Download QR codes as PNG
- Copy menu URLs
- Open menu in new tab for testing

## Database Schema

### TableOrder Model

```javascript
{
  tableNumber: String (required),
  items: [{
    menuId: ObjectId (ref: Menu),
    name: String,
    price: Number,
    quantity: Number,
    image: String,
    notes: String
  }],
  totalAmount: Number,
  status: "pending" | "preparing" | "ready" | "served" | "cancelled",
  orderNumber: Number (auto-increment),
  customerNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public (No Auth Required)

- `POST /api/table-orders` - Create new order
- `GET /api/menu` - Get menu items
- `GET /api/categories` - Get categories
- `GET /api/tables` - Get tables

### Chef & Waiter Access

- `GET /api/table-orders` - List all orders (with filters)
- `PATCH /api/table-orders/[id]` - Update order status

### Admin Only

- `DELETE /api/table-orders/[id]` - Delete order

## Order Status Flow

1. **Pending** - Customer submitted, waiting for chef
2. **Preparing** - Chef is cooking the order
3. **Ready** - Food is ready, waiting for waiter
4. **Served** - Order delivered to customer
5. **Cancelled** - Order cancelled

## Workflow Examples

### Customer Workflow

1. Scan QR code at table
2. Browse menu by category
3. Add items to cart
4. Add special instructions if needed
5. Review cart and total
6. Submit order
7. Order appears in kitchen immediately

### Chef Workflow

1. Login → Click "Kitchen Display"
2. See new order in "Pending" column
3. Click "Start Preparing" → Moves to "Preparing"
4. When done, click "Mark as Ready" → Moves to "Ready"
5. Waiter serves, clicks "Mark as Served"
6. Order removed from display

### Admin Workflow

1. Create tables in `/admin/tables`
2. Go to `/admin/qr-codes`
3. Download QR codes for each table
4. Print and place QR codes on tables
5. Customers can now order directly

## Key Features

### Real-Time Updates

- Kitchen display auto-refreshes every 10 seconds
- No manual refresh needed
- Always shows latest orders

### Time Tracking

- Shows elapsed time since order placed
- Helps prioritize older orders
- Format: "Just now", "5 mins ago", etc.

### Special Instructions

- Per-item notes (e.g., "no onions")
- General order notes (e.g., "allergies")
- Highlighted in yellow for visibility

### Visual Design

- Customer menu: Clean, modern, mobile-friendly
- Kitchen display: Dark theme, high contrast
- Color-coded status indicators
- Large, readable text for kitchen

## Integration Points

This system integrates with:

- **Tables** - Links orders to specific tables
- **Menu** - Pulls items from menu database
- **Categories** - Filters menu by category
- **Staff** - Chef and waiter access control

## QR Code Generation

Uses free QR Server API:

- No API key required
- 300x300 pixel QR codes
- Instant generation
- Downloadable as PNG

## Mobile Optimization

Customer menu is fully responsive:

- Touch-friendly buttons
- Swipeable categories
- Mobile cart dialog
- Easy quantity adjustment

## Access Control

- **Customer**: No login, public access to menu
- **Chef**: View and update orders, kitchen display
- **Waiter**: View and update orders
- **Admin**: Full access, QR code generation

## Example URLs

- Customer menu: `https://yoursite.com/menu/T1`
- Kitchen display: `https://yoursite.com/chef/kitchen`
- QR codes: `https://yoursite.com/admin/qr-codes`

## Tips for Implementation

1. Print QR codes on waterproof material
2. Place QR codes prominently on tables
3. Add instructions: "Scan to order"
4. Mount tablet/screen in kitchen for display
5. Train staff on status updates
6. Test with sample orders first
