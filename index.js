const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/tabla", async (req, res) => {
  const player = req.query.player;
  if (!player) {
    return res.status(400).json({ error: "Falta el parámetro ?player=" });
  }

  const url = `http://europe.albiondb.net/player/${player}`;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    // Espera explícita a que la tabla aparezca
    await page.waitForSelector("table", { timeout: 15000 });

    // Extraer la tabla como HTML
    const tablaHTML = await page.$eval("table", el => el.outerHTML);

    await browser.close();

    res.send(tablaHTML);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cargar la página" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy corriendo en http://localhost:${PORT}`);
});
