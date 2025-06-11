import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;

app.post('/api/create-payment', async (req, res) => {
  const { nickname } = req.body;

  const params = new URLSearchParams();
  params.append("merchant", "495742");
  params.append("secret", "kpdj7DaJ7v6SHSsazlFc0g2NHzL4T4WZ");
  params.append("price", "10000");
  params.append("label", nickname);
  params.append("curr", "CZK");
  params.append("method", "ALL");
  params.append("redirect", "https://hamocreator.github.io/THANK_YOU/");
  params.append("prepareOnly", "true");

  try {
    const response = await fetch("https://payments.comgate.cz/v1.0/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    const text = await response.text();
    const data = Object.fromEntries(new URLSearchParams(text));

    if (data.code === "0") {
      res.json({ redirect: data.redirect });
    } else {
      res.status(500).json({ error: "Chyba ComGate", detail: data });
    }
  } catch (error) {
    res.status(500).json({ error: "Chyba serveru", detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
