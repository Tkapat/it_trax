import puppeteer from "puppeteer";

(async () => {
  try {
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));
    
    await page.goto('http://127.0.0.1:1420', { waitUntil: 'networkidle0', timeout: 10000 });
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    
    console.log("Body background:", bodyBg);
    console.log("Body text length:", bodyText.length);
    
    await browser.close();
  } catch (e) {
    console.error("Script error:", e);
  }
})();
