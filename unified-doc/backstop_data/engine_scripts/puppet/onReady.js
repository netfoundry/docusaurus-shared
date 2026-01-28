/**
 * Runs after page load but before screenshot - use for interactions, waiting, hiding dynamic content
 */
module.exports = async (page, scenario, viewport, isReference, browserContext) => {
  // Log progress in greppable format: [VRT] REF desktop zlan->guides->firewall
  const mode = isReference ? 'REF' : 'TEST';
  console.log(`[VRT] ${mode} ${viewport.label} ${scenario.label}`);

  // Wait for the page to be fully loaded
  await page.waitForLoadState('networkidle');

  // Wait a bit more for any animations to settle
  await page.waitForTimeout(500);

  // Hide dynamic elements that change between renders
  await page.evaluate(() => {
    // Hide any cookie consent banners
    const cookieBanners = document.querySelectorAll('[class*="cookie"], [id*="cookie"], [class*="consent"]');
    cookieBanners.forEach(el => el.style.display = 'none');

    // Hide any live chat widgets
    const chatWidgets = document.querySelectorAll('[class*="chat"], [id*="intercom"], [id*="drift"], [id*="hubspot"]');
    chatWidgets.forEach(el => el.style.display = 'none');

    // Hide Hotjar feedback widgets
    const hotjarWidgets = document.querySelectorAll('[id*="hotjar"], [class*="_hj"]');
    hotjarWidgets.forEach(el => el.style.display = 'none');

    // Optionally hide timestamps or "last updated" text that changes
    // const timestamps = document.querySelectorAll('[class*="lastUpdated"]');
    // timestamps.forEach(el => el.style.visibility = 'hidden');
  });

  // Scroll to top to ensure consistent starting position
  await page.evaluate(() => window.scrollTo(0, 0));

  // Final wait for any lazy-loaded images
  await page.waitForTimeout(500);
};
