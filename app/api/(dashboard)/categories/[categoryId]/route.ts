import connectToDb from "@/app/lib/db";
import Category from "@/app/lib/models/category";
import User from "@/app/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

// PATCH method to update a category
export const PATCH = async (request: Request, context: { params: any }) => {
    const categoryId = context.params.categoryId;
    
    try {
        const body = await request.json();
        const { title } = body;

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // Validate userId
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Missing or error getting userId." }),
                { status: 400 }
            );
        }

        // Validate categoryId
        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Missing or error getting categoryId." }),
                { status: 400 }
            );
        }

        await connectToDb();

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "Error getting user. Not Found." }),
                { status: 404 }
            );
        }

        // Update the category
        const category = await Category.findByIdAndUpdate(
            categoryId,
            { title },
            { new: true }
        );

        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "Error getting category. Not Found." }),
                { status: 404 }
            );
        }

        return new NextResponse(
            JSON.stringify({ message: "Category Updated", category }),
            { status: 200 }
        );

    } catch (error: any) {
        return new NextResponse(
            "Error in updating category: " + error.message,
            { status: 500 }
        );
    }
};

// DELETE method to delete a category
export const DELETE = async (request: Request, context: { params: any }) => {
    const categoryId = context.params.categoryId;

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // Validate userId
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Missing or error getting userId." }),
                { status: 400 }
            );
        }

        // Validate categoryId
        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Missing or error getting categoryId." }),
                { status: 400 }
            );
        }

        await connectToDb();

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "Error getting user. Not Found." }),
                { status: 404 }
            );
        }

        // Check if category belongs to user
        const category = await Category.findOne({ _id: categoryId, user: userId });
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "Error getting category. Not found or doesn't belong to user." }),
                { status: 404 }
            );
        }

        // Delete the category
        await Category.findByIdAndDelete(categoryId);

        return new NextResponse(
            JSON.stringify({ message: "Category deleted." }),
            { status: 200 }
        );

    } catch (error: any) {
        return new NextResponse(
            "Error in deleting category: " + error.message,
            { status: 500 }
        );
    }
};
