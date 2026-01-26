const http = require('http');

const data = JSON.stringify({
    name: 'Test Staff User',
    email: 'teststaff5@example.com',
    contact: '0777123456',
    password: 'password123',
    role: 'staff'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', body);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
