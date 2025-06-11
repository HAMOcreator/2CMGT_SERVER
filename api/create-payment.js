const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/create-payment', async (req, res) => {
  const { nickname, price, label, refId, returnUrl } = req.body;

  try {
    const params = new URLSearchParams();
    params.append("merchant", process.env.COMGATE_MERCHANT);
    params.append("secret", process.env.COMGATE_SECRET);
    params.append("price", price);
    params.append("label", label);
    params.append("refId", refId);
    params.append("curr", "CZK");
    params.append("method", "ALL");
    params.append("email", `${nickname}@example.com`);
    params.append("country", "CZ");
    params.append("prepareOnly", "true");
    params.append("lang", "cs");
    params.append("returnUrl", returnUrl);

    const response = await axios.post("https://payments.comgate.cz/v1.0/create", params);
    const data = new URLSearchParams(response.data);
    const code = data.get("code");

    if (code === "0") {
      return res.json({ redirect: data.get("redirect") });
    } else {
      return res.status(400).json({ error: "Chyba ComGate", detail: data.toString() });
    }
  } catch (error) {
    return res.status(500).json({ error: "Chyba spojení se serverem." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));