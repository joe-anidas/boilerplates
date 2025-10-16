// app/api/users/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const userData = await request.json();

    if (!userData.uid || !userData.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateData: any = {
      $set: {
        email: userData.email,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    };

    if (userData.providers) {
      updateData.$addToSet = { providers: { $each: userData.providers } };
    }

    const result = await db.collection('users').updateOne(
      { uid: userData.uid },
      updateData,
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      uid: userData.uid,
      isNewUser: !!result.upsertedId
    }, { status: 200 });

  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}