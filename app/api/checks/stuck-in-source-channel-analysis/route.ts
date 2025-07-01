// Get all links which are stuck in source channel analysis / unprocessed links

import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
// import { connectDB } from '@/app/lib/db';
import { connectDB } from '@/lib/db';
import { url } from 'inspector';

export async function GET() {
    try {
        await connectDB();

        // Access the database connection 
        const db = mongoose.connection.db

        // Create the query
        const query = {
            "download_analysis.source-channel-analysis.processing_done": false
        }

        // Fetch the total count of the links
        const total = await db?.collection('links').countDocuments(query)

        // const test = await db?.collection('links').findOne({
        //     "download_analysis.source-channel-analysis.processing_done": false
        // })

        // console.log('Test document:', test);

        // Define fields to get
        const results = await db?.collection('links').find(query).project({
            link_yid: 1,
            url: 1,
            "source_channel.country_code": 1,
            createdAt: 1,
        }).limit(100).toArray()



        return NextResponse.json({ total, results })

    } catch (error) {
        console.error('Error querying links collection:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}