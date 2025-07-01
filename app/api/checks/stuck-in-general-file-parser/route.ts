import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
// import { connectDB } from '@/app/lib/db';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    const db = mongoose.connection.db;

    // 2. Query: where general-file-parser is not processed
    const query = {
      "download_analysis.general-file-parser.processing_done": false
    };

    // 3. Count total
    const total = await db?.collection('links').countDocuments(query);

    // 4. Fetch specific fields
    const results = await db?.collection('links')
      .find(query)
      .project({
        link_yid: 1,
        url: 1,
        "source_channel.country_code": 1,
        createdAt: 1
      })
      .limit(100)
      .toArray();

    // 5. Return JSON
    return NextResponse.json({ total, results });

  } catch (error) {
    console.error('Error querying general-file-parser links:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
