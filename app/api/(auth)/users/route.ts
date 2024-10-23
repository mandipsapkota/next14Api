import connectToDb from "@/app/lib/db";
import User from "@/app/lib/models/user";
import { Types } from "mongoose"; // Import ObjectId directly from mongoose
import { NextResponse } from "next/server";

export const GET = async () => {
    try {
        await connectToDb();
        const users = await User.find();
        return new NextResponse(JSON.stringify(users), { status: 200 });
    } catch (error: unknown) { // Change `any` to `unknown` for better type safety
        const message = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse("Error in fetching: " + message, { status: 500 });
    }
};

export const POST = async (request: Request) => {
    try {
        const body: Record<string, unknown> = await request.json(); // Specify a type for body
        await connectToDb();

        const user = new User(body);
        await user.save();

        return new NextResponse(JSON.stringify({ message: "User created.", user }), { status: 200 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse("Error in fetching: " + message, { status: 500 });
    }
};

export const PATCH = async (request: Request) => {
    try {
        const body: { userId: string; newUsername: string } = await request.json(); // Define the type of body
        const { userId, newUsername } = body;
        await connectToDb();

        if (!userId || !newUsername) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid request. Id or new username not found." }),
                { status: 400 }
            );
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid request. Id is not valid." }),
                { status: 400 }
            );
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: new Types.ObjectId(userId) },
            { username: newUsername },
            { new: true }
        );

        if (!updatedUser) {
            return new NextResponse(
                JSON.stringify({ message: "User not found in database." }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: "User updated", user: updatedUser }),
            { status: 200 }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse("Error while updating user: " + message, { status: 500 });
    }
};

export const DELETE = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid request. Id not found." }),
                { status: 400 }
            );
        }

        if (!Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid request. Id is not a valid ObjectId." }),
                { status: 400 }
            );
        }

        await connectToDb();

        const deletedUser = await User.findByIdAndDelete(new Types.ObjectId(userId));

        if (!deletedUser) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid request. User not found in database." }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: "User deleted.", user: deletedUser }),
            { status: 200 }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse("Error while fetching users: " + message, { status: 500 });
    }
};
