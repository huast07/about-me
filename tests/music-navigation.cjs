// Run with PLAYWRIGHT_MODULE pointing to an installed playwright package and
// PORTFOLIO_URL pointing to the locally served site (defaults to port 4173).
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    const Native = window.AudioContext;
    window.AudioContext = class extends Native {
      constructor(...args) { super(...args); window.testAudio = this; }
      createBufferSource() { const source = super.createBufferSource(); window.testSource = source; return source; }
    };
    window.visitToken = Math.random();
  });
  const root = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4173/';
  await page.goto(root);
  assert.equal(await page.locator('#musicBtn').getAttribute('aria-pressed'), 'false');
  await page.locator('#musicBtn').click();
  await page.waitForFunction(() => document.querySelector('#musicBtn').getAttribute('aria-pressed') === 'true');
  const token = await page.evaluate(() => window.visitToken);
  const time = await page.evaluate(() => testAudio.currentTime);
  assert.equal(await page.evaluate(() => testSource.loop), true);
  assert.ok(await page.evaluate(() => testSource.buffer.duration > 120));
  for (const name of ['research', 'industry', 'military', 'volunteering', 'travels', 'readings']) {
    await page.locator(`a.path[href="${name}.html"]`).evaluate(link => link.click());
    await page.waitForURL(`**/${name}.html`);
    assert.ok((await page.locator('h1').textContent()).toLowerCase().startsWith(name === 'travels' ? 'places' : name));
    assert.equal(await page.evaluate(() => window.visitToken), token);
    await page.waitForFunction(() => document.querySelector('#musicBtn').getAttribute('aria-pressed') === 'true');
    await page.locator('a.back, a.travel-back').click();
    await page.waitForURL('**/index.html');
    assert.equal(await page.locator('#tree').count(), 1);
  }
  assert.ok(await page.evaluate(() => testAudio.currentTime) > time);
  await page.goBack();
  await page.waitForURL('**/readings.html');
  await page.goForward();
  await page.waitForURL('**/index.html');
  assert.equal(await page.evaluate(() => window.visitToken), token);
  await page.locator('#musicBtn').click();
  await page.waitForFunction(() => testAudio.state === 'suspended');
  const paused = await page.evaluate(() => testAudio.currentTime);
  await page.locator('#musicBtn').click();
  await page.waitForFunction(() => testAudio.state === 'running');
  assert.ok(await page.evaluate(() => testAudio.currentTime) >= paused);
  // Direct entry starts a fresh player; navigating home initializes the tree once.
  await page.goto(root + 'research.html');
  await page.locator('#musicBtn').click();
  await page.waitForFunction(() => document.querySelector('#musicBtn').getAttribute('aria-pressed') === 'true');
  const directToken = await page.evaluate(() => window.visitToken);
  await page.locator('a.back, a.travel-back').click();
  await page.waitForSelector('#world .hero');
  assert.equal(await page.evaluate(() => window.visitToken), directToken);
  assert.equal(await page.locator('#musicBtn').getAttribute('aria-pressed'), 'true');
  // Mobile controls remain visible and the layout fits the viewport.
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.locator('#musicBtn').isVisible());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: '/private/tmp/portfolio-music-mobile.png' });
  // Failure is recoverable and rapid toggles cannot create duplicate players.
  await page.goto(root + 'industry.html');
  await page.route('**/winter-largo.mp3', route => route.fulfill({ status: 503, body: '' }));
  await page.locator('#musicBtn').click();
  await page.waitForFunction(() => document.querySelector('#musicStatus').textContent.includes('could not start'));
  assert.equal(await page.locator('#musicBtn').getAttribute('aria-pressed'), 'false');
  await page.unroute('**/winter-largo.mp3');
  await page.locator('#musicBtn').click();
  await page.waitForFunction(() => document.querySelector('#musicBtn').getAttribute('aria-pressed') === 'true');
  await page.locator('#musicBtn').click();
  await page.locator('#musicBtn').click();
  await page.waitForFunction(() => document.querySelector('#musicBtn').getAttribute('aria-pressed') === 'true');
  console.log(await page.evaluate(() => {
    const data = testSource.buffer.getChannelData(0), rate = testSource.buffer.sampleRate;
    const rms = (start, end) => Math.sqrt(data.slice(start, end).reduce((sum, x) => sum + x*x, 0) / (end-start));
    return { loopSeconds: testSource.buffer.duration, seamDelta: Math.abs(data[0] - data[data.length-1]), startRMS: rms(0,rate), endRMS: rms(data.length-rate,data.length) };
  }));
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS: all six branches, persistent audio, history, pause/resume, direct entry, mobile, no JS errors');
})().catch(error => { console.error(error); process.exit(1); });
