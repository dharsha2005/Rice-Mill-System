const http = require('http');

const testLogin = (username, password) => {
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            console.log(`Login attempt for '${username}': Status ${res.statusCode}`);
            if (res.statusCode === 200) {
                console.log('Success!');
            } else {
                console.log('Failed:', data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.write(JSON.stringify({ username, password }));
    req.end();
};

console.log('Testing Case-Insensitive Login...');
setTimeout(() => testLogin('admin', 'admin123'), 500); // Standard
setTimeout(() => testLogin('Admin', 'admin123'), 1500); // Case variation
setTimeout(() => testLogin('ADMIN', 'admin123'), 2500); // All caps
