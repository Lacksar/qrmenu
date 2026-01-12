# Billing Workflow Guide

## Quick Start

### Method 1: Quick Table Billing (Simple)

**Best for:** Single table, all orders together

1. Go to Cashier Dashboard
2. Click on the table card
3. Review and complete bill

### Method 2: Flexible Billing (Advanced)

**Best for:** Multiple tables, selective orders, split bills

1. Go to Cashier Dashboard
2. Click "New Bill" button
3. Follow the 3-step process

---

## Detailed Workflow

### Step-by-Step: Flexible Billing

#### Step 1: Select Tables

```
┌─────────────────────────────────────┐
│  Select Tables                      │
├─────────────────────────────────────┤
│                                     │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐       │
│  │ 1 │  │ 2 │  │ 3 │  │ 4 │       │
│  │✓  │  │   │  │✓  │  │   │       │
│  │2 O│  │1 O│  │1 O│  │3 O│       │
│  │$50│  │$30│  │$45│  │$90│       │
│  └───┘  └───┘  └───┘  └───┘       │
│                                     │
│  [Cancel]  [Next: Select Orders]   │
└─────────────────────────────────────┘
```

- Click on tables to select/deselect
- Selected tables show checkmark
- Can select multiple tables
- Shows order count and total per table

#### Step 2: Select Orders

```
┌─────────────────────────────────────┐
│  Select Orders                      │
├─────────────────────────────────────┤
│                                     │
│  ☑ Order #1001 - Table 1           │
│     • 2x Chicken Momo    $20.00    │
│     • 1x Dahi Puri       $15.00    │
│     Customer: John                  │
│     Total: $35.00                   │
│                                     │
│  ☐ Order #1002 - Table 1           │
│     • 1x Papaya Chat     $15.00    │
│     Customer: Sarah                 │
│     Total: $15.00                   │
│                                     │
│  ☑ Order #1003 - Table 3           │
│     • 3x Saa             $45.00    │
│     Customer: Mike                  │
│     Total: $45.00                   │
│                                     │
│  [Cancel]  [Proceed to Billing (2)] │
└─────────────────────────────────────┘
```

- Check orders to include in bill
- See full order details
- Can select orders from different tables
- Shows customer names if available

#### Step 3: Review and Complete

```
┌─────────────────────────────────────┐
│  Bill Items          │  Details     │
├──────────────────────┼──────────────┤
│                      │              │
│  Chicken Momo        │  Customer:   │
│  $10 × 2 = $20  [-][+]│  John Doe   │
│                      │              │
│  Dahi Puri           │  Phone:      │
│  $15 × 1 = $15  [-][+]│  123-456-789│
│                      │              │
│  Saa                 │  ─────────── │
│  $15 × 3 = $45  [-][+]│  Subtotal:  │
│                      │  $80.00      │
│  [+ Add Item]        │              │
│                      │  Discount:   │
│                      │  -$8.00 (10%)│
│                      │              │
│                      │  Tax (5%):   │
│                      │  +$3.60      │
│                      │              │
│                      │  Total:      │
│                      │  $75.60      │
│                      │              │
│                      │  Paid: $80   │
│                      │  Change: $4.40│
│                      │              │
│                      │  [Complete]  │
│                      │  [Print]     │
└──────────────────────┴──────────────┘
```

- Edit quantities
- Remove items
- Add customer info
- Apply discounts
- Add tax
- Calculate change
- Print and complete

---

## Common Scenarios

### Scenario 1: Two Friends, Separate Bills

**Table 5 has 2 orders:**

- Order #1001: John's order ($35)
- Order #1002: Sarah's order ($25)

**Solution:**

1. New Bill → Select Table 5 → Select Order #1001 → Complete
2. New Bill → Select Table 5 → Select Order #1002 → Complete

### Scenario 2: Group at One Table, One Bill

**Table 3 has 4 orders:**

- All orders from same group

**Solution:**

1. New Bill → Select Table 3 → Select all 4 orders → Complete

### Scenario 3: Party Across Multiple Tables

**Tables 1, 2, 3 have orders:**

- All from same party, one person paying

**Solution:**

1. New Bill → Select Tables 1, 2, 3 → Select all orders → Complete

### Scenario 4: Mixed Scenario

**Tables 1 and 4:**

- Person at Table 1 wants to pay for their order + friend's order at Table 4
- Other orders at both tables should remain

**Solution:**

1. New Bill → Select Tables 1, 4 → Select only the 2 specific orders → Complete
2. Other orders remain active for separate billing

---

## Tips for Cashiers

### Best Practices

1. **Ask for customer names** when taking orders

   - Makes it easier to identify orders during billing
   - Helps avoid confusion with multiple orders per table

2. **Verify before completing**

   - Double-check selected orders
   - Confirm table numbers
   - Review total amount

3. **Use the right method**

   - Simple single-table billing: Click table card
   - Complex scenarios: Use "New Bill" button

4. **Print receipts**
   - Always print for customer records
   - Helps with accounting and disputes

### Keyboard Shortcuts

- `Esc` - Close dialogs
- `Enter` - Confirm selections
- `Tab` - Navigate between fields

### Troubleshooting

**Problem:** Can't find an order

- **Solution:** Check if order is already completed or cancelled

**Problem:** Wrong orders selected

- **Solution:** Click "Cancel" and start over, or deselect unwanted orders

**Problem:** Need to add items not in original orders

- **Solution:** Use "Add Item" button in billing screen

**Problem:** Customer wants to split bill differently

- **Solution:** Use "New Bill" multiple times, selecting different order combinations

---

## System Behavior

### Order Status Flow

```
pending → preparing → ready → served → completed
                                    ↓
                              cancelled
```

### What Happens When Bill is Completed

1. Selected orders marked as "completed"
2. Orders removed from active billing queue
3. Table becomes available for new orders
4. Bill can be printed for records

### Data Retention

- Completed orders are stored in database
- Can be retrieved for reports and history
- Not shown in active billing interface

---

## Integration with Other Roles

### Customer Orders

- Customers place orders via menu page
- Orders appear in cashier dashboard
- Status: "pending" initially

### Waiter Orders

- Waiters can place orders on behalf of customers
- Waiter name is recorded with order
- Appears same as customer orders in billing

### Chef View

- Chefs see all orders regardless of billing status
- Billing doesn't affect kitchen workflow
- Orders remain visible until completed

### Admin View

- Admins can see all orders and bills
- Access to reports and analytics
- Can override or cancel if needed
