// /api/orders/route.js

import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Detail from "@/models/Detail";
import Menu from "@/models/Menu";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/SendEmail";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  await dbConnect();

  try {
    const detail = await Detail.findOne({ singleton: "DETAILS" });
    if (!detail) {
      return NextResponse.json(
        { success: false, error: "Details not found. Cannot create order." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { menu: items, ...restOfBody } = body;

    let totalAmount = 0;
    const processedMenuItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuId);
      if (!menuItem) {
        return NextResponse.json(
          {
            success: false,
            error: `Menu item with ID ${item.menuId} not found.`,
          },
          { status: 404 }
        );
      }
      totalAmount += menuItem.price * item.quantity;
      processedMenuItems.push({
        menuId: item.menuId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        image: menuItem.image,
      });
    }

    if (body.orderType === "homedelivery") {
      totalAmount += detail.deliveryCharge;
    }

    const deliveryCode = Math.floor(100000 + Math.random() * 900000);
    const orderData = {
      ...restOfBody,
      menu: processedMenuItems,
      totalAmount,
      deliveryCharge: detail.deliveryCharge,
      deliveryCode,
      status: "pending",
      paymentStatus: "pending",
    };

    const order = await Order.create(orderData);

    let clientSecret = null;
    if (body.paymentMethod === "online") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: "aud",
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order._id.toString(),
          Customer: order.email,
          Phone: order.phone,
          Description: `Pancetta Website #${order._id} - ${order.orderType}`,
        },
      });
      clientSecret = paymentIntent.client_secret;
      order.paymentIntentId = paymentIntent.id;
      await order.save();
    } else {
      // Send email confirmation for cash orders immediately
      await sendEmail({
        to: order.email,
        subject: "Your Order Confirmation",
        html: `
          <h2>Thank you for your order, ${order.firstName}!</h2>
          <p>Your order ID is: <strong>${order._id}</strong></p>
          <p>Your delivery code is: <strong>${order.deliveryCode}</strong></p>
          <h3>Order Summary:</h3>
          <ul>
            ${order.menu
              .map(
                (item) =>
                  `<li>${item.name} (x${item.quantity}) - $${(
                    item.price * item.quantity
                  ).toFixed(2)}</li>`
              )
              .join("")}
          </ul>
          
          <h4>Total Amount: $${order.totalAmount.toFixed(2)}</h4>
        `,
      });
    }

    const responseData = { success: true, data: order };
    if (clientSecret) {
      responseData.clientSecret = clientSecret;
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}

// GET function remains unchanged.
export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const status = searchParams.get("status");
    const searchTerm = searchParams.get("search");
    const orderType = searchParams.get("orderType");
    const skip = (page - 1) * limit;

    const filter = {};

    if (status && status.toLowerCase() !== "all") {
      filter.status = new RegExp(`^${status}$`, "i");
    }

    if (orderType && orderType.toLowerCase() !== "all") {
      filter.orderType = orderType.toLowerCase();
    }
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, "i");
      filter.$or = [
        { phone: searchRegex },
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
      ];

      if (searchTerm.match(/^[0-9a-fA-F]{24}$/)) {
        filter.$or.push({ _id: searchTerm });
      }
    }

    const orders = await Order.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
