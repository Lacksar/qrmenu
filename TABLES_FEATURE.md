# Restaurant Tables Management

## Overview

Complete CRUD system for managing restaurant tables with role-based access control.

## Features

### Admin Features (`/admin/tables`)

- Create new tables
- Edit table details
- Delete tables
- View all tables in a data table
- Set table properties:
  - Table Number (unique identifier)
  - Capacity (number of seats)
  - Location (indoor, outdoor, patio, bar)
  - Status (available, occupied, reserved, maintenance)
  - Notes (additional information)

### Waiter Features (`/waiter/tables`)

- View all tables grouped by location
- Update table status in real-time
- Filter tables by status
- Visual status indicators with color coding
- Quick status change dropdown

## Database Schema

### Table Model

```javascript
{
  tableNumber: String (unique, required),
  capacity: Number (min: 1, required),
  location: "indoor" | "outdoor" | "patio" | "bar" (required),
  status: "available" | "occupied" | "reserved" | "maintenance",
  isActive: Boolean (default: true),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public

- `GET /api/tables` - List all tables

### Admin Only

- `POST /api/tables` - Create new table
- `DELETE /api/tables/[id]` - Delete table

### Admin & Waiter

- `PATCH /api/tables/[id]` - Update table (status, notes, etc.)
- `GET /api/tables/[id]` - Get single table

## UI Components Used

All components from shadcn/ui:

- `Table` - Data table for admin view
- `Dialog` - Modal for create/edit forms
- `Card` - Table cards in waiter view
- `Badge` - Status indicators
- `Select` - Dropdowns for location and status
- `Button` - Action buttons
- `Input` - Form inputs
- `Textarea` - Notes field
- `Label` - Form labels

## Status Colors

- **Available** - Green (ready for customers)
- **Occupied** - Red (currently in use)
- **Reserved** - Yellow (booked for later)
- **Maintenance** - Gray (out of service)

## Workflow Examples

### Admin Workflow

1. Login → Navigate to `/admin/tables`
2. Click "Add Table"
3. Fill in table details
4. Click "Create Table"
5. Table appears in the list
6. Edit or delete as needed

### Waiter Workflow

1. Login → Navigate to `/waiter` → Click "Manage Tables"
2. View tables grouped by location
3. Filter by status if needed
4. Change table status using dropdown
5. Status updates immediately

## Access Control

- **Admin**: Full CRUD access
- **Waiter**: Can view and update table status
- **Chef**: No access to tables
- **Public**: Can view tables (for reservation system integration)

## Integration Points

This tables system can be integrated with:

- Reservation system (assign tables to reservations)
- Order system (link orders to specific tables)
- Seating management (track table availability)
- Analytics (table utilization reports)
