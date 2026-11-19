const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  try {
    const page = await browser.newPage();
    const root = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173/';
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const checkSections = async () => {
      await page.waitForURL('**/index.html#sections');
      await page.waitForFunction(() => {
        const links = [...document.querySelectorAll('#sections .path')];
        return links.length === 6 && links.every(el => {
          const r = el.getBoundingClientRect();
          return r.top >= 72 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && +getComputedStyle(el).opacity > .99;
        });
      });
      assert.equal(await page.locator('.paths').evaluate(el => el === document.activeElement), true);
    };
    for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
      await page.setViewportSize(viewport);
      await page.goto(root + 'research.html');
      const token = await page.evaluate(() => window.branchTestToken = Math.random());
      for (const name of ['research','industry','military','volunteering','travels','readings']) {
        if (name !== 'research') {
          await page.locator(`.path[href="${name}.html"]`).click();
          await page.waitForURL(`**/${name}.html`);
        }
        await page.locator('a.back, a.travel-back').click();
        await checkSections();
        assert.equal(await page.evaluate(() => window.branchTestToken), token, 'Navigation keeps the document and music player alive');
      }
      await page.goBack();
      await page.waitForURL('**/readings.html');
      await page.goForward();
      await checkSections();
      await page.reload();
      await checkSections();
      await page.getByRole('link', {name:'Sterling Huang — Home',exact:true}).click();
      await page.waitForFunction(() => scrollY === 0);
      assert.equal(new URL(page.url()).hash, '');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: six branch returns, direct home initialization, desktop/mobile box visibility, history, refresh, and homepage brand link');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
