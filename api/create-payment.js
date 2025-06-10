import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*'); // ✅ Přidáno
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // ✅ Preflight odpověď
  }

  if (req.method !== 'POST') return res.status(405).end();

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
      res.status(200).json({ redirect: data.redirect });
    } else {
      res.status(500).json({ error: "Chyba ComGate", detail: data });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error", detail: error.message });
  }
}
