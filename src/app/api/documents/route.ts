import { NextResponse } from "next/server";
import { db } from "@/src/lib/db";

export async function GET() {
  const documents = await db
    .collection("documents")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    success: true,
    documents: documents.map((doc) => ({
      _id: doc._id.toString(),
      filename: doc.filename,
      pages: doc.pages,
    })),
  });
}
