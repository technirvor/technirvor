const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createChatLogsTable() {
  try {
    console.log('Creating chat_logs table...');
    
    // Check if table already exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'chat_logs')
      .eq('table_schema', 'public');
    
    if (tables && tables.length > 0) {
      console.log('✅ chat_logs table already exists!');
      return;
    }
    
    console.log('\n📝 Please run the following SQL in your Supabase SQL Editor:');
    console.log('\n' + '='.repeat(80));
    
    const sqlContent = fs.readFileSync(path.join(__dirname, 'create-chat-logs.sql'), 'utf8');
    console.log(sqlContent);
    
    console.log('='.repeat(80));
    if (supabaseUrl) {
      console.log('\n🔗 Go to: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql');
    }
    console.log('\n✅ After running the SQL, the chat_logs table will be ready!');
    
  } catch (error) {
    console.error('Error:', error);
    console.log('\n📝 Please run the SQL manually in Supabase SQL Editor.');
  }
}

createChatLogsTable();