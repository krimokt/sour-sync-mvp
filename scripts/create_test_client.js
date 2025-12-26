/**
 * Script to create a test client for whitesourcing
 * 
 * Run this with: node scripts/create_test_client.js
 * 
 * Make sure you have NEXT_PUBLIC_SITE_URL set in your environment
 */

const fetch = require('node-fetch');

const TEST_CLIENT = {
  email: 'client@test.com',
  password: 'Test123456',
  fullName: 'Test Client',
  companyName: 'Test Client Company'
};

async function createTestClient() {
  const apiUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const endpoint = `${apiUrl}/api/client/whitesourcing/auth/signup`;

  console.log('Creating test client for whitesourcing...');
  console.log('Email:', TEST_CLIENT.email);
  console.log('Password:', TEST_CLIENT.password);
  console.log('\nCalling:', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CLIENT),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error:', data.error);
      process.exit(1);
    }

    console.log('\n✅ Client created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email:', TEST_CLIENT.email);
    console.log('Password:', TEST_CLIENT.password);
    console.log('\nLogin URL:');
    console.log(`${apiUrl}/site/whitesourcing/signin`);
    console.log('\nClient Dashboard URL:');
    console.log(`${apiUrl}/client/whitesourcing`);

  } catch (error) {
    console.error('Failed to create client:', error.message);
    process.exit(1);
  }
}

createTestClient();











