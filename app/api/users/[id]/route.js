import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// DELETE user (Admin only)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findByIdAndDelete(params.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update user (Admin only for status, or self for password)
export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isActive, password, currentPassword } = await req.json();

    await dbConnect();

    // User changing their own password (requires current password)
    if (password && currentPassword) {
      const sessionUserId = session.user.id.toString();
      const paramsUserId = params.id.toString();

      console.log("Session User ID:", sessionUserId);
      console.log("Params User ID:", paramsUserId);
      console.log("Match:", sessionUserId === paramsUserId);

      // Check if user is changing their own password
      if (sessionUserId === paramsUserId) {
        const user = await User.findById(params.id);
        if (!user) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 }
          );
        }

        user.password = password;
        await user.save();
        return NextResponse.json(
          { message: "Password updated successfully" },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: "You can only change your own password" },
          { status: 403 }
        );
      }
    }

    // Admin operations (require admin role)
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Admin changing user password (no current password needed)
    if (password && !currentPassword) {
      const user = await User.findById(params.id);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      user.password = password;
      await user.save();
      return NextResponse.json(
        { message: "Password updated successfully" },
        { status: 200 }
      );
    }

    // Admin updating user status
    if (typeof isActive !== "undefined") {
      const updateData = { isActive };
      const user = await User.findByIdAndUpdate(params.id, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(
        { message: "User updated successfully", user },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user", details: error.message },
      { status: 500 }
    );
  }
}
