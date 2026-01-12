# Billing System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Restaurant POS System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Customer │  │  Waiter  │  │   Chef   │  │ Cashier  │   │
│  │  Orders  │  │  Orders  │  │  Kitchen │  │ Billing  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │             │          │
│       └─────────────┴──────────────┴─────────────┘          │
│                          │                                   │
│                          ▼                                   │
│              ┌───────────────────────┐                      │
│              │   Table Orders API    │                      │
│              └───────────────────────┘                      │
│                          │                                   │
│                          ▼                                   │
│              ┌───────────────────────┐                      │
│              │   MongoDB Database    │                      │
│              └───────────────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
app/
├── cashier/
│   ├── page.js                    # Dashboard (2 views)
│   ├── new-bill/
│   │   └── page.js               # Flexible billing
│   └── billing/
│       └── [table]/
│           └── page.js           # Quick billing
│
components/
└── ui/
    ├── checkbox.jsx              # Selection component
    ├── dialog.jsx                # Modal dialogs
    ├── button.jsx                # Action buttons
    ├── card.jsx                  # Content cards
    └── ...                       # Other UI components
```

### Backend API

```
app/api/
├── table-orders/
│   ├── route.js                  # GET all, POST new
│   └── [id]/
│       └── route.js              # PATCH update, DELETE
├── tables/
│   └── route.js                  # GET all tables
└── menu/
    └── route.js                  # GET menu items
```

### Database Schema

```
TableOrder {
  _id: ObjectId
  tableNumber: String
  orderNumber: Number
  items: [
    {
      menuId: ObjectId
      name: String
      price: Number
      quantity: Number
      image: String
      notes: String
    }
  ]
  totalAmount: Number
  status: Enum [pending, preparing, ready, served, completed, cancelled]
  customerNotes: String
  customerName: String
  createdBy: Enum [customer, waiter]
  waiterName: String
  createdAt: Date
  updatedAt: Date
}
```

## Data Flow Diagrams

### Order Creation Flow

```
Customer/Waiter
      │
      ▼
  Place Order
      │
      ▼
  POST /api/table-orders
      │
      ▼
  Save to Database
      │
      ▼
  Return Order Object
      │
      ▼
  Show in Dashboard
```

### Quick Billing Flow

```
Cashier Dashboard
      │
      ▼
Click Table Card
      │
      ▼
GET /api/table-orders?tableNumber=X
      │
      ▼
Load All Orders for Table
      │
      ▼
Display Billing Page
      │
      ▼
Review & Edit
      │
      ▼
Complete Bill
      │
      ▼
PATCH /api/table-orders/[id] (status: completed)
      │
      ▼
Redirect to Dashboard
```

### Flexible Billing Flow

```
Cashier Dashboard
      │
      ▼
Click "New Bill"
      │
      ▼
GET /api/table-orders (all active)
GET /api/tables (all tables)
      │
      ▼
Step 1: Select Tables
      │
      ├─ Filter tables with orders
      ├─ Show order count per table
      └─ Multi-select interface
      │
      ▼
Step 2: Select Orders
      │
      ├─ Filter orders for selected tables
      ├─ Show order details
      └─ Multi-select with checkboxes
      │
      ▼
Step 3: Review & Complete
      │
      ├─ Combine selected orders
      ├─ Edit quantities
      ├─ Apply discounts/tax
      └─ Calculate totals
      │
      ▼
Complete Bill
      │
      ▼
PATCH /api/table-orders/[id] × N
(Update all selected orders)
      │
      ▼
Redirect to Dashboard
```

## State Management

### Cashier Dashboard State

```javascript
{
  tables: [],              // All tables
  orders: [],              // All active orders
  loading: boolean,        // Loading state
  viewMode: string,        // 'tables' | 'orders'
  completeDialog: {        // Dialog state
    open: boolean,
    orderId: string
  }
}
```

### Flexible Billing State

```javascript
{
  // Data
  orders: [],              // All active orders
  tables: [],              // All tables

  // Selection
  selectedTables: [],      // Selected table numbers
  selectedOrders: [],      // Selected order IDs

  // Bill
  billItems: [],           // Combined items
  customerName: string,
  customerPhone: string,
  discountType: string,    // 'Percentage' | 'Fixed'
  discountValue: number,
  taxValue: number,
  amountPaid: string,
  paymentMethod: string,

  // UI
  loading: boolean,
  processing: boolean,
  showTableDialog: boolean,
  showOrderDialog: boolean
}
```

### Quick Billing State

```javascript
{
  // Data
  orders: [],              // Orders for this table
  billItems: [],           // Editable items
  menuItems: [],           // Available menu items

  // Bill details
  customerName: string,
  customerPhone: string,
  discountType: string,
  discountValue: number,
  taxValue: number,
  amountPaid: string,
  paymentMethod: string,

  // UI
  loading: boolean,
  processing: boolean,
  showAddItemDialog: boolean,
  cancelDialog: {
    open: boolean,
    orderId: string
  }
}
```

## Security & Access Control

### Authentication Flow

```
User Login
    │
    ▼
NextAuth Session
    │
    ▼
Check Role
    │
    ├─ Admin → Full Access
    ├─ Cashier → Billing Access
    ├─ Waiter → Order Management
    ├─ Chef → Kitchen View
    └─ Customer → Menu & Orders
```

### Authorization Matrix

| Role     | View Orders | Create Orders | Update Status | Billing | Admin |
| -------- | ----------- | ------------- | ------------- | ------- | ----- |
| Customer | Own         | Yes           | No            | No      | No    |
| Waiter   | All         | Yes           | Yes           | No      | No    |
| Chef     | All         | No            | Yes           | No      | No    |
| Cashier  | All         | No            | Yes           | Yes     | No    |
| Admin    | All         | Yes           | Yes           | Yes     | Yes   |

## Performance Considerations

### Optimization Strategies

1. **Data Fetching**

   - Fetch only active orders
   - Filter on server side
   - Use query parameters
   - Cache table data

2. **State Updates**

   - Local state for UI
   - Batch API calls
   - Optimistic updates
   - Error handling

3. **Rendering**

   - Lazy load dialogs
   - Virtualize long lists
   - Memoize calculations
   - Debounce inputs

4. **Database**
   - Index on tableNumber
   - Index on status
   - Index on orderNumber
   - Compound indexes

### Scalability

```
Current: Single Restaurant
    │
    ▼
Future: Multi-Location
    │
    ├─ Add locationId to orders
    ├─ Filter by location
    ├─ Separate databases
    └─ Centralized reporting
```

## Error Handling

### Error Types

1. **Network Errors**

   - Retry logic
   - Offline mode
   - Queue requests
   - Show status

2. **Validation Errors**

   - Client-side validation
   - Server-side validation
   - User feedback
   - Prevent submission

3. **Business Logic Errors**
   - Order already completed
   - Table not found
   - Invalid status transition
   - Insufficient permissions

### Error Recovery

```
Error Occurs
    │
    ▼
Catch Error
    │
    ▼
Log Error
    │
    ▼
Show User Message
    │
    ▼
Offer Recovery Options
    │
    ├─ Retry
    ├─ Cancel
    └─ Contact Support
```

## Monitoring & Logging

### Key Metrics

1. **Performance**

   - Page load time
   - API response time
   - Database query time
   - Render time

2. **Business**

   - Orders per hour
   - Average bill amount
   - Completion rate
   - Error rate

3. **User**
   - Active cashiers
   - Bills per cashier
   - Average handling time
   - Customer satisfaction

### Logging Strategy

```javascript
// Client-side
console.log("User action");
console.error("Error occurred");

// Server-side
logger.info("API request");
logger.error("Database error");

// Analytics
track("bill_completed", {
  amount: total,
  items: count,
  tables: tableNumbers,
  duration: time,
});
```

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Production Environment         │
├─────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         Next.js Application        │ │
│  │  (Server-Side Rendering + API)     │ │
│  └────────────────────────────────────┘ │
│                   │                      │
│                   ▼                      │
│  ┌────────────────────────────────────┐ │
│  │       MongoDB Atlas Database       │ │
│  │     (Cloud-hosted, Replicated)     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         CDN (Static Assets)        │ │
│  └────────────────────────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **Framework:** Next.js 15
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** Radix UI
- **Icons:** Lucide React
- **Notifications:** Sonner

### Backend

- **Runtime:** Node.js
- **Framework:** Next.js API Routes
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** NextAuth.js

### DevOps

- **Version Control:** Git
- **Package Manager:** npm
- **Deployment:** Vercel / Custom
- **Database:** MongoDB Atlas

## Future Architecture

### Planned Enhancements

1. **Microservices**

   ```
   Monolith → Microservices
       │
       ├─ Order Service
       ├─ Billing Service
       ├─ Menu Service
       ├─ User Service
       └─ Analytics Service
   ```

2. **Real-time Updates**

   ```
   WebSocket / Server-Sent Events
       │
       ├─ Live order updates
       ├─ Kitchen notifications
       ├─ Table status changes
       └─ Bill completion alerts
   ```

3. **Mobile Apps**

   ```
   Web App → Native Apps
       │
       ├─ React Native
       ├─ iOS App
       ├─ Android App
       └─ Tablet App
   ```

4. **Advanced Features**
   ```
   Current → Enhanced
       │
       ├─ AI-powered recommendations
       ├─ Predictive analytics
       ├─ Inventory management
       ├─ Customer loyalty program
       └─ Multi-location support
   ```
