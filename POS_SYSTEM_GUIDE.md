# Single-Page POS System Guide

## Overview

The new POS (Point of Sale) system provides a **single-page interface** similar to modern restaurant POS systems, with:

- **Left side:** Menu items with categories and search
- **Right side:** Current bill with live calculations
- **Manage Orders:** Handle existing table orders

## Access

**URL:** `/cashier/pos`

**From Dashboard:** Click the **"POS"** button (cyan/blue button)

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  POS  [Manage Orders]                    [Settings] [Logout] │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                   │
│  CATEGORIES              │  CURRENT BILL                     │
│  ├─ All Categories       │  ┌─────────────────────────────┐ │
│  ├─ Chaat                │  │ Customer Name               │ │
│  ├─ Momo                 │  │ Customer Phone              │ │
│  └─ ...                  │  └─────────────────────────────┘ │
│                          │                                   │
│  [Search products...]    │  Items:                           │
│                          │  • Chicken Momo x2    ₹200.00    │
│  ┌────┐ ┌────┐ ┌────┐   │  • Dahi Puri x1       ₹69.00     │
│  │Item│ │Item│ │Item│   │  • Papaya Chat x1     ₹169.00    │
│  │₹100│ │₹50 │ │₹69 │   │                                   │
│  └────┘ └────┘ └────┘   │  Subtotal:            ₹438.00    │
│  ┌────┐ ┌────┐ ┌────┐   │  Discount (10%):      -₹43.80    │
│  │Item│ │Item│ │Item│   │  Tax (5%):            +₹19.71    │
│  └────┘ └────┘ └────┘   │  ─────────────────────────────   │
│                          │  Total:               ₹413.91    │
│                          │                                   │
│                          │  Amount Paid:         ₹500.00    │
│                          │  Change:              ₹86.09     │
│                          │                                   │
│                          │  [✓ Checkout]                    │
└──────────────────────────┴──────────────────────────────────┘
```

## Features

### 1. Menu Section (Left)

#### Categories Sidebar

- Click category to filter items
- "All Categories" shows everything
- Active category is highlighted

#### Search Bar

- Type to search items by name
- Real-time filtering
- Works with category filter

#### Menu Items Grid

- Click any item to add to bill
- Shows item image, name, and price
- Responsive grid layout

### 2. Current Bill (Right)

#### Customer Information

- Enter customer name (optional)
- Enter customer phone (optional)
- Saved with the bill

#### Bill Items

- Shows all items in current bill
- Each item displays:
  - Name and unit price
  - Quantity controls (- / +)
  - Total price
  - Remove button (trash icon)

#### Calculations

- **Subtotal:** Sum of all items
- **Discount:** Enter percentage (e.g., 10 for 10%)
- **Tax:** Enter percentage (e.g., 5 for 5%)
- **Total:** Final amount to pay
- **Amount Paid:** Enter payment amount
- **Change:** Automatically calculated

#### Checkout Button

- Completes the bill
- Marks selected orders as completed (if any)
- Clears the bill
- Ready for next customer

### 3. Manage Orders

Click **"Manage Orders"** button to:

#### Step 1: Select Tables

- Shows all tables with active orders
- Click tables to select (can select multiple)
- Shows order count and total per table
- Click "Next: View Orders"

#### Step 2: View Orders

- Shows all orders from selected tables
- Each order displays:
  - Order number and status
  - Table number
  - Customer name (if available)
  - Items and prices
  - Total amount
- Select orders using checkboxes

#### Actions:

1. **Add & Complete:** Adds selected orders to current bill
2. **Complete Selected:** Marks orders as completed without adding to bill

## Use Cases

### Case 1: Walk-in Customer (New Order)

```
1. Click menu items to add to bill
2. Adjust quantities as needed
3. Enter customer info (optional)
4. Apply discount/tax if needed
5. Enter amount paid
6. Click Checkout
```

### Case 2: Complete Existing Table Order

```
1. Click "Manage Orders"
2. Select the table
3. Click "Next: View Orders"
4. Select the order(s)
5. Click "Add & Complete"
6. Review bill (already populated)
7. Enter amount paid
8. Click Checkout
```

### Case 3: Combine Multiple Table Orders

```
1. Click "Manage Orders"
2. Select multiple tables
3. Click "Next: View Orders"
4. Select all orders to combine
5. Click "Add & Complete"
6. Bill shows combined items
7. Apply discount if needed
8. Enter amount paid
9. Click Checkout
```

### Case 4: Mix New Items + Existing Orders

```
1. Click "Manage Orders"
2. Select table and add orders to bill
3. Click menu items to add more items
4. Adjust quantities
5. Complete checkout
```

### Case 5: Just Complete Orders (No New Bill)

```
1. Click "Manage Orders"
2. Select table(s)
3. Select order(s)
4. Click "Complete Selected"
5. Orders marked as completed
6. No bill created
```

## Keyboard & Mouse

### Quick Actions

- **Click item:** Add to bill
- **Click category:** Filter items
- **Type in search:** Filter items
- **+/- buttons:** Adjust quantity
- **Trash icon:** Remove item

### Tips

- Double-click item to add 2 quickly
- Use search for fast item lookup
- Categories help organize large menus
- Discount/tax auto-calculate

## Workflow Examples

### Example 1: Simple Order

```
Customer orders 2 Chicken Momo + 1 Dahi Puri

1. Click "Chicken Momo" (adds 1)
2. Click "+" to make it 2
3. Click "Dahi Puri" (adds 1)
4. Enter amount paid: ₹300
5. See change: ₹31
6. Click Checkout
```

### Example 2: Table Order with Discount

```
Table 5 has order, wants 10% discount

1. Click "Manage Orders"
2. Select Table 5
3. Select their order
4. Click "Add & Complete"
5. Enter discount: 10
6. Enter amount paid
7. Click Checkout
```

### Example 3: Split Bill

```
Table 3 has 2 orders, pay separately

First person:
1. Manage Orders → Table 3
2. Select first order
3. Add & Complete
4. Checkout

Second person:
1. Manage Orders → Table 3
2. Select second order
3. Add & Complete
4. Checkout
```

### Example 4: Group Payment

```
Tables 1, 2, 3 - one person paying

1. Manage Orders
2. Select Tables 1, 2, 3
3. Select all orders
4. Add & Complete
5. Apply discount if needed
6. Checkout
```

## Benefits

### For Cashiers

✅ **Fast:** Single-page, no navigation
✅ **Intuitive:** Click items to add
✅ **Flexible:** Handle any scenario
✅ **Visual:** See menu and bill together
✅ **Efficient:** Quick calculations

### For Customers

✅ **Quick service:** Faster checkout
✅ **Accurate:** Real-time calculations
✅ **Transparent:** See items and prices
✅ **Flexible:** Easy to modify orders

### For Restaurant

✅ **Professional:** Modern POS interface
✅ **Accurate:** Automated calculations
✅ **Flexible:** Handle complex scenarios
✅ **Efficient:** Faster table turnover

## Comparison with Other Methods

| Feature        | POS System    | Quick Billing | Flexible Billing |
| -------------- | ------------- | ------------- | ---------------- |
| Interface      | Single page   | Separate page | Multi-step       |
| Speed          | ⚡⚡⚡ Fast   | ⚡⚡ Medium   | ⚡ Slower        |
| Add items      | ✅ Yes        | ✅ Yes        | ❌ No            |
| Manage orders  | ✅ Yes        | ✅ Limited    | ✅ Yes           |
| Best for       | All scenarios | Single table  | Complex billing  |
| Learning curve | Easy          | Easy          | Medium           |

## Tips & Tricks

### Speed Tips

1. **Use categories** to narrow down items quickly
2. **Use search** when you know the item name
3. **Double-click** items to add multiple
4. **Keep common items** in "All Categories" view

### Accuracy Tips

1. **Verify quantities** before checkout
2. **Check customer info** if needed
3. **Confirm discount** percentage
4. **Verify amount paid** before completing

### Efficiency Tips

1. **Clear bill** after each customer
2. **Use Manage Orders** for table orders
3. **Apply tax** if required by law
4. **Print receipts** for records

## Troubleshooting

| Problem              | Solution                            |
| -------------------- | ----------------------------------- |
| Item not showing     | Check category filter or search     |
| Can't find order     | Click "Manage Orders"               |
| Wrong quantity       | Use +/- buttons to adjust           |
| Wrong item added     | Click trash icon to remove          |
| Discount not working | Enter percentage (e.g., 10 for 10%) |
| Change not showing   | Enter amount paid first             |
| Checkout disabled    | Add at least one item               |

## Best Practices

### Start of Shift

1. Open POS system
2. Verify menu items load
3. Check for pending orders
4. Ensure printer works

### During Service

1. Keep bill clear between customers
2. Verify amounts before checkout
3. Apply discounts correctly
4. Confirm payment received

### End of Shift

1. Complete all pending bills
2. Check for incomplete orders
3. Print summary reports
4. Hand over to next shift

## Training Checklist

- [ ] Understand POS layout
- [ ] Practice adding items
- [ ] Practice adjusting quantities
- [ ] Practice removing items
- [ ] Use category filters
- [ ] Use search function
- [ ] Apply discounts
- [ ] Apply tax
- [ ] Calculate change
- [ ] Complete checkout
- [ ] Manage existing orders
- [ ] Select multiple tables
- [ ] Combine orders
- [ ] Complete orders directly
- [ ] Handle split bills

## Conclusion

The single-page POS system provides a modern, efficient interface for handling all billing scenarios. It combines the speed of direct item selection with the flexibility of managing existing orders, all in one intuitive interface.

**Recommended for:** All cashiers, all scenarios, daily use

**Access:** Click "POS" button from cashier dashboard or go to `/cashier/pos`
