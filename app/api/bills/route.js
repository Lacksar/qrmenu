import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Bill from "@/models/Bill";
import Customer from "@/models/Customer";

// GET all bills with pagination
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    const [bills, total] = await Promise.all([
      Bill.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Bill.countDocuments(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: bills,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch bills",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// POST create new bill
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      items,
      customerName,
      customerPhone,
      subtotal,
      discount,
      tax,
      total,
      amountPaid,
      unpaid,
      paymentMethod,
      createdBy,
      createdByName,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Items are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    let customer = null;
    let finalCustomerName = customerName;
    let finalCustomerPhone = customerPhone;
    let customerId = null;

    // Handle customer logic
    if (customerName || customerPhone) {
      if (customerPhone) {
        // Phone number provided - check if customer exists
        customer = await Customer.findOne({ phone: customerPhone });

        if (customer) {
          // Customer exists - use existing customer
          finalCustomerName = customerName || customer.name;
          finalCustomerPhone = customerPhone;
          customerId = customer._id;

          // Update customer name if provided and different
          if (customerName && customerName !== customer.name) {
            customer.name = customerName;
          }

          // Add unpaid amount to customer's due
          if (unpaid > 0) {
            customer.dueAmount += unpaid;
          }

          await customer.save();
        } else {
          // Customer doesn't exist - create new customer
          finalCustomerName = customerName || "Walk-in";
          finalCustomerPhone = customerPhone;

          customer = await Customer.create({
            name: finalCustomerName,
            phone: finalCustomerPhone,
            dueAmount: unpaid || 0,
          });

          customerId = customer._id;
        }
      } else if (customerName) {
        // Only name provided, no phone - create customer without phone
        // This allows tracking customers by name only
        finalCustomerName = customerName;
        finalCustomerPhone = null;

        customer = await Customer.create({
          name: finalCustomerName,
          phone: null,
          dueAmount: unpaid || 0,
        });

        customerId = customer._id;
      }
    }

    // Generate bill number
    const lastBill = await Bill.findOne().sort({ billNumber: -1 });
    const billNumber = lastBill ? lastBill.billNumber + 1 : 1000;

    const bill = await Bill.create({
      billNumber,
      items,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      customerId,
      subtotal,
      discount,
      tax,
      total,
      amountPaid,
      unpaid,
      paymentMethod,
      createdBy,
      createdByName,
    });

    return NextResponse.json(
      { success: true, message: "Bill created successfully", data: bill },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create bill",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
