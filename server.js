
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.urlencoded({ extended: true }));

app.post('/notify', (req, res) => {
  const { label, status, transId } = req.body;

  const record = {
    label,
    status,
    transId,
    timestamp: new Date().toISOString()
  };

  fs.readFile('db.json', 'utf8', (err, data) => {
    const records = data ? JSON.parse(data) : [];
    records.push(record);
    fs.writeFile('db.json', JSON.stringify(records, null, 2), () => {
      res.send('OK');
    });
  });
});

app.get('/', (req, res) => {
  res.send('ComGate Server is running');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
