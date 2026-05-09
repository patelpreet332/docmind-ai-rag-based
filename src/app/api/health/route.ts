import { NextResponse } from "next/server";
import { client } from "@/src/lib/db";

export async function GET() {
  try {
    await client.connect();

    await client.db().admin().ping();

    return NextResponse.json({
      success: true,
      service: "DocMind AI",
      database: "connected",
      status: "running",
      time: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        service: "DocMind AI",
        database: "failed",
        status: "error",
      },
      { status: 500 }
    );
  }
}
