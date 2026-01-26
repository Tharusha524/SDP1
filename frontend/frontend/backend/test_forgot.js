const http = require('http');

function testForgot(email, label) {
    const data = JSON.stringify({ email });
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/forgot-password',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
            console.log(`[${label}] Status:`, res.statusCode);
            console.log(`[${label}] Body:`, Buffer.concat(chunks).toString());
        });
    });

    req.on('error', e => console.error(`[${label}] Error:`, e.message));
    req.write(data);
    req.end();
}

// 1. Valid email (admin)
testForgot('admin@marukawa.com', 'Valid Email');

// 2. Invalid email
setTimeout(() => {
    testForgot('nonexistent@gmail.com', 'Invalid Email');
}, 1000);
