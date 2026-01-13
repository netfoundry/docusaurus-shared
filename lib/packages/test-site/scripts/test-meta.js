const puppeteer = require('puppeteer');

async function testMetaTags(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const metaTags = await page.evaluate(() => {
        const tags = {};
        const metas = document.querySelectorAll('meta');

        metas.forEach(meta => {
            const property = meta.getAttribute('property');
            const name = meta.getAttribute('name');
            const content = meta.getAttribute('content');

            if (property && property.startsWith('og:')) {
                tags[property] = content;
            }
            if (name && name.startsWith('twitter:')) {
                tags[name] = content;
            }
        });

        return tags;
    });

    console.log('Social Media Meta Tags:');
    console.log(JSON.stringify(metaTags, null, 2));

    await browser.close();
}

// Usage: node scripts/test-meta.js
testMetaTags('http://localhost:3000/meta/');