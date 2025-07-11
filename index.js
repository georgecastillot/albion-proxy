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
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled"
      ]
    });

    const page = await browser.newPage();

    // Disfrazar Puppeteer como navegador real
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    // Ir a la URL y esperar la carga completa
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Esperar explícitamente a que aparezca la tabla
    await page.waitForSelector("table", { timeout: 30000 });

    // Extraer la tabla completa como HTML
    const tablaHTML = await page.$eval("table", (el) => el.outerHTML);

    await browser.close();

    // Enviar la tabla como respuesta
    res.send(tablaHTML);
  } catch (err) {
    console.error("❌ Error al cargar la página:", err);
    res.status(500).json({ error: "Error al cargar la página o la tabla no existe." });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Proxy AlbionDB con Puppeteer está funcionando.");
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy corriendo en http://localhost:${PORT}`);
});
