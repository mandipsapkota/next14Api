import connectToDb from "@/app/lib/db";
import Category from "@/app/lib/models/category";
import User from "@/app/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

interface CreateCategoryRequestBody {
    title: string;
}

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // Validate userId
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId." }),
                { status: 400 }
            );
        }

        await connectToDb();

        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId. No user exists." }),
                { status: 400 }
            );
        }

        // Fetch categories for the user
        const categories = await Category.find({
            user: new Types.ObjectId(userId),
        });

        return new NextResponse(
            JSON.stringify(categories),
            { status: 200 }
        );
    } catch (error: any) {
        return new NextResponse(
            "Error while getting categories for user: " + error.message,
            { status: 500 }
        );
    }
}

export const POST = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        // Validate the request body
        const body: CreateCategoryRequestBody = await request.json();
        const { title } = body;

        // Validate userId
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId." }),
                { status: 400 }
            );
        }

        await connectToDb();

        const user = await User.findById(userId);

        // Check if the user exists
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "User not found" }),
                { status: 400 }
            );
        }

        // Create a new category
        const newCategory = new Category({
            title,
            user: new Types.ObjectId(userId),
        });

        await newCategory.save();

        return new NextResponse(
            JSON.stringify({ message: "Category is created", category: newCategory }),
            { status: 200 }
        );

    } catch (error: any) {
        return new NextResponse(
            "Error while creating category: " + error.message,
            { status: 500 }
        );
    }
}
