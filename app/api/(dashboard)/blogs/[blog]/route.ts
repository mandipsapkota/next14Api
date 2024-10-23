import connectToDb from "@/app/lib/db";
import Blog from "@/app/lib/models/blogs";
import Category from "@/app/lib/models/category";
import User from "@/app/lib/models/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async (request: Request, context: { params: any }) => {
    const blogId = context.params.blog;
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const categoryId = searchParams.get("categoryId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId." }), {
                    status: 400,
                }
            );
        }

        if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing categoryId." }), {
                    status: 400,
                }
            );
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing blogId." }), {
                    status: 400,
                }
            );
        }

        await connectToDb();

        const user = await User.findById(userId);
        if (!user) {
            return new NextResponse(
                JSON.stringify({ message: "No user exists with this id." }), {
                    status: 404,
                }
            );
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return new NextResponse(
                JSON.stringify({ message: "No category exists with this id." }), {
                    status: 404,
                }
            );
        }

        const blog = await Blog.findOne({
            _id: blogId,
            user: userId,
            category: categoryId,
        });

        if (!blog) {
            return new NextResponse(
                JSON.stringify({ message: "No blog found." }), {
                    status: 404,
                }
            );
        }

        return new NextResponse(
            JSON.stringify(blog), {
                status: 200,
            }
        );
    } catch (error: any) {
        return new NextResponse(
            "Error while fetching a blog: " + error.message,
            {
                status: 500
            }
        );
    }
};

export const PATCH = async (request: Request, context: { params: any }) => {
    const blogId = context.params.blog;

    try {
        const body = await request.json();
        const { title, description } = body;

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId." }), {
                    status: 400,
                }
            );
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing blogId." }), {
                    status: 400,
                }
            );
        }

        await connectToDb();

        const blog = await Blog.findOne({ _id: blogId, user: userId });
        if (!blog) {
            return new NextResponse(
                JSON.stringify({ message: "No blog found." }), {
                    status: 404,
                }
            );
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            { title, description },
            { new: true }
        );

        return new NextResponse(
            JSON.stringify({ message: "Updated Blog", blog: updatedBlog }), {
                status: 200,
            }
        );

    } catch (error: any) {
        return new NextResponse(
            "Error while updating a blog: " + error.message,
            {
                status: 500
            }
        );
    }
};

export const DELETE = async (request: Request, context: { params: any }) => {
    const blogId = context.params.blog;

    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId || !Types.ObjectId.isValid(userId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing userId." }), {
                    status: 400,
                }
            );
        }

        if (!blogId || !Types.ObjectId.isValid(blogId)) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or missing blogId." }), {
                    status: 400,
                }
            );
        }

        await connectToDb();

        const blog = await Blog.findOne({ _id: blogId, user: userId });
        if (!blog) {
            return new NextResponse(
                JSON.stringify({ message: "No blog found." }), {
                    status: 404,
                }
            );
        }

        // Actually delete the blog
        await Blog.findByIdAndDelete(blogId);

        return new NextResponse(
            JSON.stringify({ message: "Deleted Blog" }), {
                status: 200,
            }
        );

    } catch (error: any) {
        return new NextResponse(
            "Error while deleting a blog: " + error.message,
            {
                status: 500
            }
        );
    }
};
