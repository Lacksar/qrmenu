# Flexible Billing System

## Overview

The new flexible billing system allows cashiers to create bills with maximum flexibility, supporting multiple scenarios:

1. **Single Order Billing** - Bill one order from one table
2. **Multiple Orders from Same Table** - Combine multiple orders from the same table
3. **Cross-Table Billing** - Combine orders from different tables into one bill
4. **Selective Order Billing** - Choose specific orders to include in a bill

## Features

### 1. Multi-Step Billing Process

#### Step 1: Select Tables

- View all tables with active orders
- Select one or multiple tables
- See order count and total amount per table
- Visual indication of selected tables

#### Step 2: Select Orders

- View all orders from selected tables
- Each order shows:
  - Order number and status
  - Table number
  - Customer name (if provided)
  - Waiter name (if order was created by waiter)
  - Individual items and prices
  - Total amount
- Select specific orders using checkboxes
- Combine orders from different customers/tables

#### Step 3: Review and Complete Bill

- View combined bill items
- Edit quantities
- Remove items if needed
- Add customer information
- Apply discounts (percentage or fixed amount)
- Add tax
- Select payment method
- Calculate change
- Print bill
- Complete and mark orders as completed

### 2. Use Cases

#### Case 1: Individual Billing at Same Table

**Scenario:** Two friends at Table 5, each wants separate bills

**Steps:**

1. Click "New Bill" button
2. Select Table 5
3. Select only the first person's order
4. Complete billing
5. Repeat for second person's order

#### Case 2: Combined Billing at Same Table

**Scenario:** Group of 4 at Table 3, one person pays for everyone

**Steps:**

1. Click "New Bill" button
2. Select Table 3
3. Select all orders from Table 3
4. System automatically combines all items
5. Complete billing

#### Case 3: Cross-Table Billing

**Scenario:** Large party split across Tables 1, 2, and 3, one bill for all

**Steps:**

1. Click "New Bill" button
2. Select Tables 1, 2, and 3
3. Select all orders from all three tables
4. System combines all items into one bill
5. Complete billing

#### Case 4: Partial Cross-Table Billing

**Scenario:** Person at Table 1 wants to pay for their order + their friend's order at Table 4

**Steps:**

1. Click "New Bill" button
2. Select Tables 1 and 4
3. Select specific orders (not all orders from both tables)
4. Complete billing

## Navigation

### Accessing the New Billing System

1. **From Cashier Dashboard:**

   - Click "New Bill" button at the top of the page
   - This opens the flexible billing interface

2. **Quick Table Billing (Legacy):**
   - Click on a table card in the dashboard
   - This goes directly to billing for that specific table
   - Useful for simple single-table billing

## Technical Details

### Order Status Flow

- `pending` → `preparing` → `ready` → `served` → `completed`
- Orders can be `cancelled` at any stage
- Only non-completed and non-cancelled orders appear in billing

### Data Structure

Each order contains:

- `tableNumber`: Table identifier
- `orderNumber`: Unique order number
- `items`: Array of menu items with quantities
- `totalAmount`: Order total
- `status`: Current order status
- `customerName`: Optional customer name
- `waiterName`: Optional waiter name (if created by waiter)
- `createdBy`: "customer" or "waiter"

### Bill Completion

When a bill is completed:

1. All selected orders are marked as `completed`
2. Orders are removed from active billing queue
3. Table becomes available for new orders
4. Bill can be printed for customer records

## UI Components

### Table Selection Dialog

- Grid layout showing all tables with orders
- Visual indicators for selection
- Shows order count and total per table
- Responsive design for mobile and desktop

### Order Selection Dialog

- List view of all orders from selected tables
- Checkbox selection for each order
- Detailed order information
- Status badges
- Customer and waiter information

### Billing Panel

- Editable item list with quantity controls
- Customer information fields
- Discount and tax calculations
- Payment method selection
- Real-time total calculation
- Change calculation
- Print functionality

## Best Practices

1. **Always verify order details** before completing a bill
2. **Use customer names** when taking orders to make billing easier
3. **Double-check table numbers** when doing cross-table billing
4. **Print bills** for customer records and accounting
5. **Confirm payment** before marking orders as completed

## Future Enhancements

Potential improvements:

- Split bill by items (not just by orders)
- Save partial bills for later completion
- Bill history and reprinting
- Integration with payment gateways
- Receipt email functionality
- Tip calculation
- Multiple payment methods per bill
