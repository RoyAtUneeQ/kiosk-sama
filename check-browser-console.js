import puppeteer from 'puppeteer';

async function checkBrowserConsole() {
  console.log('Launching browser to check console errors...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Capture console messages
  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();

    if (type === 'error') {
      consoleErrors.push(text);
      console.log('❌ Console Error:', text);
    } else if (type === 'warning') {
      console.log('⚠️  Console Warning:', text);
    } else {
      consoleLogs.push(text);
      console.log('📝 Console Log:', text);
    }
  });

  page.on('pageerror', (error) => {
    console.log('🔴 Page Error:', error.message);
    consoleErrors.push(error.message);
  });

  try {
    console.log('\nNavigating to http://localhost:5173/...\n');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle2',
      timeout: 10000,
    });

    // Wait a bit for any async errors
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if the page loaded successfully
    const title = await page.title();
    console.log('\n✅ Page title:', title);

    // Check for visible error messages
    const errorElements = await page.$$eval('*', (elements) => {
      return elements
        .filter((el) => el.textContent && el.textContent.toLowerCase().includes('error'))
        .map((el) => el.textContent)
        .slice(0, 5);
    });

    if (errorElements.length > 0) {
      console.log('\n⚠️  Found error text in page:');
      errorElements.forEach((text) => console.log('  -', text.substring(0, 100)));
    }

    // Try to find the start button
    const startButton = await page.$('.kiosk-start-button');
    if (startButton) {
      const isDisabled = await page.$eval('.kiosk-start-button', (el) => el.disabled);
      console.log('\n✅ Start button found, disabled:', isDisabled);
    } else {
      console.log('\n❌ Start button not found');
    }

    // Summary
    console.log('\n=== Summary ===');
    console.log('Console errors:', consoleErrors.length);
    console.log('Console logs:', consoleLogs.length);

    if (consoleErrors.length > 0) {
      console.log('\n🔴 Errors found:');
      consoleErrors.forEach((err, i) => console.log(`${i + 1}.`, err));
    }
  } catch (error) {
    console.error('Error during browser check:', error.message);
  } finally {
    await browser.close();
  }
}

checkBrowserConsole().catch(console.error);
