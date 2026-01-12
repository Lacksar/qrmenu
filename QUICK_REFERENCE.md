# Billing System - Quick Reference Card

## 🚀 Quick Access

### Cashier Dashboard

- URL: `/cashier`
- Shows all tables with active orders
- Two views: Tables | All Orders

### Billing Methods

#### Method 1: Quick Billing

**When to use:** Single table, all orders together

```
Click Table Card → Review → Complete
```

#### Method 2: Flexible Billing

**When to use:** Multiple tables, specific orders, split bills

```
Click "New Bill" → Select Tables → Select Orders → Complete
```

---

## 📋 Common Tasks

### Split Bill at Same Table

```
1. Click "New Bill"
2. Select the table
3. Select first person's order(s)
4. Complete bill
5. Repeat for other person(s)
```

### Combine Multiple Tables

```
1. Click "New Bill"
2. Select all tables (click multiple)
3. Select all orders
4. Complete bill
```

### Pay for Friend at Different Table

```
1. Click "New Bill"
2. Select both tables
3. Select only the 2 specific orders
4. Complete bill
```

---

## 🎯 Billing Screen Features

### Left Panel: Bill Items

- View all items
- Adjust quantities: `[-]` `[+]`
- Remove items: `[🗑️]`
- Add items: `[+ Add Item]`

### Right Panel: Details

- Customer name/phone
- Discount (% or $)
- Tax (%)
- Payment method
- Amount paid
- Change calculation
- `[Complete Bill]` button
- `[Print Bill]` button

---

## 💡 Pro Tips

### ✅ Do's

- ✅ Ask customer names when taking orders
- ✅ Verify table numbers before completing
- ✅ Double-check selected orders
- ✅ Print receipts for records
- ✅ Use quick billing for simple cases

### ❌ Don'ts

- ❌ Don't complete without verifying
- ❌ Don't forget to print receipts
- ❌ Don't use flexible billing for simple cases
- ❌ Don't rush through order selection

---

## 🔧 Troubleshooting

| Problem               | Solution                             |
| --------------------- | ------------------------------------ |
| Can't find order      | Check if already completed/cancelled |
| Wrong orders selected | Click Cancel and start over          |
| Need to add items     | Use "Add Item" button                |
| Want different split  | Create multiple bills                |
| Table not showing     | No active orders for that table      |

---

## 📊 Order Status

```
pending → preparing → ready → served → completed
                                    ↓
                              cancelled
```

**Active orders:** pending, preparing, ready, served  
**Inactive orders:** completed, cancelled

Only active orders appear in billing.

---

## ⌨️ Keyboard Shortcuts

- `Esc` - Close dialogs
- `Enter` - Confirm
- `Tab` - Next field

---

## 📞 Need Help?

1. Check `BILLING_WORKFLOW.md` for detailed examples
2. Check `FLEXIBLE_BILLING_SYSTEM.md` for technical details
3. Ask supervisor or manager
4. Review training materials

---

## 🎓 Training Checklist

- [ ] Understand both billing methods
- [ ] Practice quick billing
- [ ] Practice flexible billing
- [ ] Try split bill scenario
- [ ] Try cross-table billing
- [ ] Learn to add items
- [ ] Learn to apply discounts
- [ ] Practice printing bills
- [ ] Handle payment and change

---

## 📱 Mobile Tips

- Dialogs are scrollable
- Use landscape for better view
- Tap to select tables/orders
- Swipe to scroll items

---

## 🔐 Access Control

**Who can access:**

- Cashiers
- Admins

**Who cannot:**

- Customers
- Waiters
- Chefs

---

## 💾 Data Safety

- Bills are saved automatically
- Completed orders are archived
- Can't undo completion
- Print receipts for backup

---

## 📈 Best Practices

1. **Start of Shift**

   - Check for pending orders
   - Review table status
   - Ensure printer works

2. **During Service**

   - Process bills promptly
   - Keep receipts organized
   - Verify payments

3. **End of Shift**
   - Complete all pending bills
   - Print summary reports
   - Hand over to next shift

---

## 🎯 Success Metrics

**Good Performance:**

- Fast billing times
- No billing errors
- Happy customers
- Accurate payments
- Clean handovers

**Red Flags:**

- Frequent corrections
- Customer complaints
- Missing receipts
- Payment discrepancies
- Incomplete bills

---

## 📝 Quick Formulas

**Discount (%):**

```
Discount = Subtotal × (Discount% ÷ 100)
```

**Tax:**

```
Tax = (Subtotal - Discount) × (Tax% ÷ 100)
```

**Total:**

```
Total = Subtotal - Discount + Tax
```

**Change:**

```
Change = Amount Paid - Total
```

---

## 🌟 Remember

> "The goal is happy customers and accurate billing.  
> Take your time, verify everything, and ask if unsure."

---

**Last Updated:** January 2026  
**Version:** 1.0  
**System:** Flexible Billing System
