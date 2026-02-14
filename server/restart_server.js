// Script to restart server and test API
const { spawn } = require('child_process');

console.log('Starting server...');

const server = spawn('node', ['app.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Wait for server to start
setTimeout(() => {
  console.log('\n=== Testing API ===');
  
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/inventory',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      server.kill();
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.error(`Request error: ${e.message}`);
    server.kill();
    process.exit(1);
  });

  req.end();
}, 3000);
