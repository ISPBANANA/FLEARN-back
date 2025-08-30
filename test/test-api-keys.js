// test/test-api-keys.js
require('dotenv').config();

/**
 * Simple test script to verify API key configuration
 */
async function testApiKeys() {
    console.log('🔧 Testing API Key Configuration...\n');

    // Test environment variables
    console.log('📋 Environment Variables:');
    console.log(`PORT: ${process.env.PORT || 'Not set'}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
    console.log(`INTERNAL_API_KEY: ${process.env.INTERNAL_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log(`AUTH0_DOMAIN: ${process.env.AUTH0_DOMAIN || '❌ Not set'}`);
    console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set'}`);
    console.log();

    // Test making requests to your own API
    if (process.env.INTERNAL_API_KEY) {
        console.log('🔒 Testing Protected Endpoint...');
        
        try {
            const response = await fetch('http://localhost:8099/api/protected/users', {
                headers: {
                    'x-api-key': process.env.INTERNAL_API_KEY
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Protected endpoint test passed');
                console.log('Response:', data);
            } else {
                console.log('❌ Protected endpoint test failed:', response.status);
            }
        } catch (error) {
            console.log('❌ Could not connect to server. Make sure it\'s running on port 8099');
        }
    }

    console.log('\n🔄 To test manually:');
    console.log('1. Start your server: npm start');
    console.log('2. Test public endpoint: curl http://localhost:8099/api/public/info');
    console.log(`3. Test protected endpoint: curl -H "x-api-key: ${process.env.INTERNAL_API_KEY || 'YOUR_API_KEY'}" http://localhost:8099/api/protected/users`);
}

// Run the test
testApiKeys().catch(console.error);
