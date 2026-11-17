// Recruiter paths, keyboard navigation, readable travel text, and playback regression.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  try {
    const root = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173/';
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(root);
    await page.locator('#home-intro').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.setViewportSize({width:390,height:844});
    const menu = page.locator('.site-menu');
    await menu.locator('summary').click();
    await page.getByRole('navigation', {name:'Mobile navigation'}).getByRole('link', {name:'Projects',exact:true}).click();
    await page.waitForURL('**/industry.html');
    await menu.locator('summary').click();
    await page.getByRole('navigation', {name:'Mobile navigation'}).getByRole('link', {name:'Research',exact:true}).click();
    await page.waitForURL('**/research.html');
    assert.equal(await menu.getAttribute('open'), null);
    assert.equal(await page.locator('h1').evaluate(el => el === document.activeElement), true);
    assert.equal(await menu.locator('a[aria-current="page"]').textContent(), 'Research');
    await menu.locator('summary').click();
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('open'), null);
    assert.equal(await menu.locator('summary').evaluate(el => el === document.activeElement), true);
    await menu.locator('summary').click();
    await page.locator('#musicBtn').focus();
    assert.equal(await menu.getAttribute('open'), null, 'Menu closes when keyboard focus leaves it');
    await menu.locator('summary').click();
    await page.setViewportSize({width:1440,height:900});
    await page.waitForTimeout(100);
    assert.equal(await menu.getAttribute('open'), null, 'Menu closes when the desktop navigation appears');
    await page.setViewportSize({width:390,height:844});
    await page.goBack();
    await page.waitForURL('**/industry.html');
    assert.equal(await menu.locator('a[aria-current="page"]').textContent(), 'Projects');
    for (const name of ['index','research','industry','biketo','military','volunteering','travels','readings']) {
      await page.goto(root + name + '.html');
      await page.evaluate(() => document.fonts.ready);
      for (const width of [320,390,768,1280,1440]) {
        await page.setViewportSize({width,height:900});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name} fits ${width}px`);
        assert.equal(await page.locator('#topbar').evaluate(el => [...el.querySelectorAll('a,button,summary')].filter(item => item.checkVisibility()).every(item => {
          const r=item.getBoundingClientRect();return r.left >= -1 && r.right <= innerWidth + 1;
        })), true, `${name} header fits ${width}px`);
      }
    }
    await page.goto(root + 'biketo.html');
    assert.equal(await page.getByRole('link', {name:'Download on the App Store ↗'}).getAttribute('href'), 'https://apps.apple.com/ca/app/biketo/id6761314510');
    for (const image of await page.locator('.app-screenshots img').all()) {
      await image.scrollIntoViewIfNeeded();await image.evaluate(img => img.decode());
    }
    await page.goto(root + 'travels.html');
    await page.getByRole('link', {name:'Read travel takeaways',exact:true}).click();
    await page.getByRole('button', {name:'Plain-text view',exact:true}).click();
    assert.equal(await page.locator('.journal-word').evaluateAll(words => words.every(word => getComputedStyle(word).opacity === '1')), true);
    assert.ok((await page.locator('.journal-entry').textContent()).includes('how little I truly know'));
    assert.equal(await page.getByRole('button', {name:'Handwritten view',exact:true}).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', {name:'Handwritten view',exact:true}).click();
    assert.equal(await page.locator('.travel-journal').evaluate(el => el.classList.contains('plain-text')), false);
    const carousel = page.locator('.travel-carousel');
    await carousel.scrollIntoViewIfNeeded();
    await carousel.getByRole('button', {name:'Pause slideshow',exact:true}).click();
    const counter=carousel.locator('.travel-carousel-controls span');
    const before=await counter.textContent();
    await carousel.getByRole('button', {name:'Play slideshow',exact:true}).click();
    await page.mouse.move(0,0);
    assert.equal(await page.evaluate(() => document.activeElement.className), 'carousel-playback');
    await page.waitForFunction(value => document.querySelector('.travel-carousel-controls span').textContent !== value, before, {timeout:5000});
    await carousel.getByRole('button', {name:'Pause slideshow',exact:true}).click();
    const paused=await counter.textContent();await page.waitForTimeout(2300);
    assert.equal(await counter.textContent(),paused);
    assert.deepEqual(errors, []);
    console.log('PASS: homepage navigation, mobile menu and Escape, focus and history, all-page layouts at five widths, app screenshots, plain text, Play resumes with focus');
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exit(1);});
