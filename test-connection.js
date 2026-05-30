/**
 * Quick script to test backend connectivity
 * Run: node test-connection.js
 */

const http = require('http');

// Your backend configuration
const BACKEND_HOST = '172.18.58.26'; // Your Wi-Fi IP
const BACKEND_PORT = 5000;

console.log('🔍 Testing backend connection...\n');
console.log(`Target: http://${BACKEND_HOST}:${BACKEND_PORT}/health\n`);

const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: '/health',
    method: 'GET',
    timeout: 5000,
};

const req = http.request(options, (res) => {
    console.log('✅ Connection successful!');
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Status Message: ${res.statusMessage}\n`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
        console.log('\n✅ Backend is reachable from this machine!');
        console.log('📱 Your phone should be able to connect if on the same Wi-Fi network.\n');
    });
});

req.on('error', (error) => {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Make sure backend is running (npm start in backend folder)');
    console.error('2. Check if backend is listening on port 5000');
    console.error('3. Verify the IP address is correct (run ipconfig on Windows)');
    console.error('4. Check firewall settings');
    console.error('5. Make sure you\'re on the same network\n');
});

req.on('timeout', () => {
    console.error('❌ Connection timeout!');
    console.error('Backend is not responding within 5 seconds.\n');
    req.destroy();
});

req.end();
