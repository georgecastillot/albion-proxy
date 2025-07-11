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

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  // DEBUG: mostrar todo el HTML de la página
  const htmlContent = await page.content();
  console.log("📄 HTML cargado:", htmlContent);

  await page.waitForSelector("table", { timeout: 60000 });

  const tablaHTML = await page.$eval("table", (el) => el.outerHTML);

  await browser.close();

  res.send(tablaHTML);
} catch (err) {
  console.error("❌ Error al cargar la página:", err);
  res.status(500).json({ error: "Error al cargar la página o la tabla no existe." });
}
