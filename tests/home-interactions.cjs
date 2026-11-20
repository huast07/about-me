const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH});
  try {
    const page = await browser.newPage();
    const root = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173/';
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const viewport of [{width:1440,height:900}, {width:390,height:844}]) {
      await page.setViewportSize(viewport);
      await page.goto(root + 'index.html');
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('#sections').evaluate(el => el.inert && getComputedStyle(el).visibility === 'hidden'), true);
      await page.locator('.story-start').click();
      await page.waitForTimeout(1600);
      const point = await page.locator('.mark.on p').first().evaluate(el => {
        const r = el.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + 8, r.top + 12);
        return {x:r.left + 8, y:r.top + 12, textHit:el.contains(hit)};
      });
      assert.equal(point.textHit, true, 'Visible timeline text receives pointer input');
      const before = await page.evaluate(() => ({y:scrollY, url:location.href}));
      await page.mouse.move(point.x, point.y);
      await page.mouse.down();
      await page.mouse.move(point.x + 90, point.y, {steps:12});
      await page.mouse.up();
      await page.waitForTimeout(150);
      const after = await page.evaluate(() => ({y:scrollY, url:location.href, selected:getSelection().toString()}));
      assert.ok(after.selected.length > 0, 'Dragging selects timeline text');
      assert.equal(after.y, before.y, 'Selection does not jump to the six boxes');
      assert.equal(after.url, before.url, 'Selection does not open a hidden branch link');
      await page.goto(root + 'index.html#sections');
      await page.waitForFunction(() => document.querySelector('.finale.on') && !document.querySelector('.finale').inert);
      await page.evaluate(() => scrollBy(0, -100));
      await page.waitForTimeout(1500);
      const y = await page.evaluate(() => scrollY);
      // Click the empty gap between cards: focus on the nav must not jump the page.
      const gap = await page.locator('.paths').evaluate(el => {
        const first = el.children[0].getBoundingClientRect();
        const second = el.children[1].getBoundingClientRect();
        return {x:(first.right + second.left)/2, y:first.top + 20};
      });
      await page.mouse.click(gap.x, gap.y);
      assert.equal(await page.evaluate(() => scrollY), y, 'Pointer focus leaves the scroll position alone');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.matches('.path')), true, 'Cards remain keyboard accessible');
    }
    assert.deepEqual(errors, []);
    console.log('PASS: hidden sections cannot intercept input or display scrollbars; desktop/mobile text selection stays in place; visible cards support keyboard navigation');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exit(1);});
