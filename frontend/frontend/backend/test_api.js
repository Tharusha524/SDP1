const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'marukawa-cement-secret-key-2026';
const token = jwt.sign({ id: 'USR-0001', role: 'admin', email: 'sanduni123@gmail.com' }, secret, { expiresIn: '1h' });

function get(path) {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: 5000, path, headers: { Authorization: 'Bearer ' + token } };
    http.get(opts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          resolve({ path, status: res.statusCode, success: j.success, dataCount: j.orders ? j.orders.length : j.staff ? j.staff.length : j.tasks ? j.tasks.length : j.inventory ? j.inventory.length : JSON.stringify(j.stats || j).slice(0,80) });
        } catch(e) {
          resolve({ path, status: res.statusCode, raw: data.slice(0, 200) });
        }
      });
    }).on('error', e => resolve({ path, error: e.message }));
  });
}

Promise.all([
  get('/api/orders'),
  get('/api/admin/stats'),
  get('/api/admin/staff'),
  get('/api/admin/tasks'),
  get('/api/admin/inventory'),
]).then(results => {
  results.forEach(r => console.log(JSON.stringify(r)));
  process.exit(0);
});
