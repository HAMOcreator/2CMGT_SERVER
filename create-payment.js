
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const qs = require("qs");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nickname, product } = req.body;

  if (!nickname || !product) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const dataPath = path.join(__dirname, "data", "products_data.json");
  let products;

  try {
    const fileData = fs.readFileSync(dataPath, "utf8");
    products = JSON.parse(fileData);
  } catch (error) {
    return res.status(500).json({ error: "Failed to read product data" });
  }

  const selected = products.find((p) => p.name === product);
  if (!selected) {
    return res.status(404).json({ error: "Product not found" });
  }

  const refId = `${product}-${nickname}`;

  const payload = {
    merchant: "495742",
    price: selected.price * 100,
    curr: "CZK",
    label: refId,
    refId: refId,
    method: "ALL",
    email: "",
    url: "https://hamocreator.github.io/THANK_YOU/",
    secret: "kpdj7DaJ7v6SHSsazlFc0g2NHzL4T4WZ",
  };

  try {
    const response = await fetch("https://payments.comgate.cz/v1.0/create", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: qs.stringify(payload),
    });

    const text = await response.text();
    const params = new URLSearchParams(text);
    const code = params.get("code");

    if (code !== "0") {
      return res.status(500).json({ error: "Chyba ComGate", detail: Object.fromEntries(params) });
    }

    const redirect = params.get("redirect");
    return res.status(200).json({ redirect });
  } catch (err) {
    return res.status(500).json({ error: "Chyba spojení se serverem." });
  }
};
