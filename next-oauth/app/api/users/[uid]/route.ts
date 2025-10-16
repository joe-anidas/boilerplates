// app/api/users/[uid]/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await context.params;

    if (!uid) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection('users').findOne({ 
      uid
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return only necessary fields
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}