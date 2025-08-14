// Simple script to seed the database with sample data
// Run with: node scripts/seed-data.js

const seedData = async () => {
  try {
    console.log('Seeding database with sample trading data...');
    
    const response = await fetch('http://localhost:3000/api/dashboard/sample-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Sample data created successfully!');
    console.log(`   - ${result.data.trades} completed trades`);
    console.log(`   - ${result.data.history} trading history entries`);
    console.log(`   - ${result.data.aiData} AI learning data entries`);
    console.log('\nYou can now view your dashboard at http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.log('\nMake sure your Next.js development server is running (npm run dev)');
    console.log('Also ensure your Supabase environment variables are configured correctly.');
  }
};

// Check if we can run the script
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with fetch support');
  console.log('Alternatively, you can call the API endpoint manually:');
  console.log('POST http://localhost:3000/api/dashboard/sample-data');
} else {
  seedData();
}