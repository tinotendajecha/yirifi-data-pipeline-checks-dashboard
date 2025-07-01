import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
// import { connectDB } from '@/app/lib/db';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    const db = mongoose.connection.db;

    // 2. Query: where website scraping is not done AND exclude_link is not true
    const query = {
      "download_analysis.website-scraping.processing_done": false,
      exclude_link: { $ne: true }  // <-- This excludes excluded links
    };

    // 3. Count matching documents
    const total = await db?.collection('links').countDocuments(query);

    // 4. Fetch selected fields
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

    // 5. Return the data
    return NextResponse.json({ total, results });

  } catch (error) {
    console.error('Error querying links for website scraping:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
