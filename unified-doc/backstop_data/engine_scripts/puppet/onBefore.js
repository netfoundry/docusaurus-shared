/**
 * Runs before each scenario - use for login, cookie setup, etc.
 *
 * Note: This runs with Playwright engine, not Puppeteer.
 */
module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  // Block analytics/tracking scripts that create console noise
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (
      url.includes('hotjar') ||
      url.includes('googletagmanager') ||
      url.includes('google-analytics') ||
      url.includes('algolia') // search - not needed for screenshots
    ) {
      route.abort();
    } else {
      route.continue();
    }
  });
};
