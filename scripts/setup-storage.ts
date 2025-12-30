/**
 * Setup script to create the discussion-media storage bucket
 * Run with: npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local file
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('Setting up storage bucket...');

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError);
    process.exit(1);
  }

  const bucketExists = buckets?.some(b => b.name === 'discussion-media');

  if (bucketExists) {
    console.log('✓ Bucket "discussion-media" already exists');
  } else {
    // Create the bucket
    const { data, error } = await supabase.storage.createBucket('discussion-media', {
      public: true,
      fileSizeLimit: 52428800, // 50MB (free tier limit)
      allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ]
    });

    if (error) {
      console.error('Error creating bucket:', error);
      process.exit(1);
    }

    console.log('✓ Created bucket "discussion-media"');
  }

  console.log('\n✅ Storage setup complete!');
  console.log('You can now upload photos and videos to discussions.');
}

setupStorage();
