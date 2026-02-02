import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enablePlatform() {
  console.log('Enabling platform...');
  
  // Get the platform status ID first
  const { data: statusData, error: fetchError } = await supabase
    .from('platform_status')
    .select('id, is_enabled')
    .limit(1)
    .single();
  
  console.log('Current status:', statusData);
  
  if (fetchError) {
    console.error('Error fetching platform status:', fetchError);
    return;
  }
  
  if (statusData?.id) {
    const { error: enableError } = await supabase
      .from('platform_status')
      .update({ 
        is_enabled: true, 
        disabled_reason: null,
        auto_disabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', statusData.id);
    
    if (enableError) {
      console.error('Error enabling platform:', enableError);
    } else {
      console.log('Platform enabled successfully!');
    }
  } else {
    console.log('No platform status record found');
  }
}

enablePlatform();
