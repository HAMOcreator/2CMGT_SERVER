const https = require('https');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { nickname, product } = req.body;

  if (!nickname || !product) {
    return res.status(400).json({ error: 'Missing nickname or product' });
  }

  const filePath = path.join(__dirname, 'data', 'products_data.json');
  const rawData = fs.readFileSync(filePath);
  const products = JSON.parse(rawData);

  const selected = products.find(p => p.name === product && p.type === 'Standard');
  if (!selected) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const postData = querystring.stringify({
    merchant: '495742',
    secret: 'kpdj7DaJ7v6SHSsazlFc0g2NHzL4T4WZ',
    price: selected.price,
    label: product + ' - ' + nickname,
    refId: nickname + '-' + Date.now(),
    method: 'ALL',
    curr: 'CZK',
    country: 'CZ',
    email: '',
    url: 'https://hamocreator.github.io/THANK_YOU/'
  });

  const options = {
    hostname: 'payments.comgate.cz',
    port: 443,
    path: '/v1.0/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  const cgReq = https.request(options, cgRes => {
    let data = '';
    cgRes.on('data', chunk => { data += chunk; });
    cgRes.on('end', () => {
      const params = querystring.parse(data);
      if (params.code === '0') {
        res.status(200).json({ redirect: params.redirect });
      } else {
        res.status(500).json({ error: 'Chyba ComGate', detail: params });
      }
    });
  });

  cgReq.on('error', error => {
    res.status(500).json({ error: 'Request failed', detail: error });
  });

  cgReq.write(postData);
  cgReq.end();
};