import connectToDb from "@/app/lib/db";
import Blog from "@/app/lib/models/blogs";
import Category from "@/app/lib/models/category";
import User from "@/app/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

// Define the expected structure for the blog request body
interface BlogRequestBody {
    title: string;
    description: string;
}

export const GET = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        const searchKeywords = searchParams.get("keywords") || '';
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        // Validate userId
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId." }),
                { status: 400 }
            );
        }

        // Validate categoryId
        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing categoryId." }),
                { status: 400 }
            );
        }

        await connectToDb();

        // Validate user existence
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "No user exists with this id." }),
                { status: 404 }
            );
        }

        // Validate category existence
        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "No category exists with this id." }),
                { status: 404 }
            );
        }

        // Construct filter
        const filter: any = {
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId),
        };

        if (searchKeywords) {
            filter.$or = [
                { title: { $regex: searchKeywords, $options: 'i' } },
                { description: { $regex: searchKeywords, $options: 'i' } }
            ];
        }

        if (startDate) {
            filter.createdAt = {
                ...filter.createdAt,
                ...(endDate ? { $gte: new Date(startDate), $lte: new Date(endDate) } : { $gte: new Date(startDate) })
            };
        } else if (endDate) {
            filter.createdAt = { $lte: new Date(endDate) };
        }

        const skip = (page - 1) * limit;
        const blogs = await Blog.find(filter).skip(skip).limit(limit);
        const totalBlogs = await Blog.countDocuments(filter);

        return new NextResponse(
            JSON.stringify({ blogs, totalBlogs, page, limit }),
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Error in GET:", error);
        return new NextResponse(
            JSON.stringify({ message: "Error while fetching blogs." }),
            { status: 500 }
        );
    }
}

export const POST = async (request: Request) => {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        const body: BlogRequestBody = await request.json();
        const { title, description } = body;

        // Validate userId
        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId." }),
                { status: 400 }
            );
        }

        // Validate categoryId
        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing categoryId." }),
                { status: 400 }
            );
        }

        await connectToDb();

        // Validate user existence
        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "No user exists with this id." }),
                { status: 404 }
            );
        }

        // Validate category existence
        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "No category exists with this id." }),
                { status: 404 }
            );
        }

        const newBlog = new Blog({
            title,
            description,
            user: new Types.ObjectId(userId),
            category: new Types.ObjectId(categoryId),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await newBlog.save();

        return new NextResponse(
            JSON.stringify({ message: "New blog created", blog: newBlog }),
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Error in POST:", error);
        return new NextResponse(
            JSON.stringify({ message: "Error while creating blog." }),
            { status: 500 }
        );
    }
}
