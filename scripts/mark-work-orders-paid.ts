import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function markWorkOrdersPaid() {
  console.log('Marking all completed work orders as paid...');
  
  // Get all unpaid completed work orders
  const { data: unpaidOrders, error: fetchError } = await supabase
    .from('work_orders')
    .select('id, title, quoted_cost')
    .eq('status', 'completed')
    .eq('paid', false);
  
  if (fetchError) {
    console.error('Error fetching work orders:', fetchError);
    return;
  }
  
  console.log(`Found ${unpaidOrders?.length || 0} unpaid work orders`);
  
  if (!unpaidOrders || unpaidOrders.length === 0) {
    console.log('No unpaid work orders to mark as paid');
    return;
  }
  
  // Mark them all as paid
  const { error: updateError } = await supabase
    .from('work_orders')
    .update({ 
      paid: true, 
      paid_at: new Date().toISOString() 
    })
    .eq('status', 'completed')
    .eq('paid', false);
  
  if (updateError) {
    console.error('Error marking work orders as paid:', updateError);
    return;
  }
  
  console.log('Successfully marked all work orders as paid!');
  
  // Also enable the platform - direct update
  console.log('Enabling platform...');
  
  // Get the platform status ID first
  const { data: statusData } = await supabase
    .from('platform_status')
    .select('id')
    .limit(1)
    .single();
  
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
      console.log('Platform enabled!');
    }
  } else {
    console.log('No platform status record found');
  }
}

markWorkOrdersPaid();
