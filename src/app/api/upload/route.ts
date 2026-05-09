import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";
import { extractPdfText } from "@/src/lib/pdf";
import { chunkText } from "@/src/lib/chunk";
import { getEmbedding } from "@/src/lib/embed";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Extract text
    const pdf = await extractPdfText(buffer);

    // 2. Save main document
    const documentResult = await db.collection("documents").insertOne({
      filename: file.name,
      text: pdf.text,
      pages: pdf.pages,
      createdAt: new Date(),
    });

    const documentId = documentResult.insertedId;

    // 3. Chunk text
    const chunks = chunkText(pdf.text, 500);

    // 4. Create embeddings + store chunks
    const chunkDocs = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await getEmbedding(chunks[i]);

      chunkDocs.push({
        documentId,
        chunkIndex: i,
        text: chunks[i],
        embedding,
        createdAt: new Date(),
      });
    }

    if (chunkDocs.length > 0) {
      await db.collection("chunks").insertMany(chunkDocs);
    }

    return NextResponse.json({
      success: true,
      documentId,
      filename: file.name,
      pages: pdf.pages,
      chunksStored: chunkDocs.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
