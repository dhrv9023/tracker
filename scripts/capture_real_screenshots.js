// ==========================================================================
// CAPTURE REAL SITE SCREENSHOTS USING HEADLESS GOOGLE CHROME
// ==========================================================================

import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function capture() {
  console.log('Launching headless Google Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1440,900',
    ],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
    },
  });

  const page = await browser.newPage();

  console.log('Navigating to http://127.0.0.1:5173/...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0', timeout: 30000 });

  // Initialize localStorage with completed onboarding and rich demo profile
  await page.evaluate(() => {
    localStorage.setItem('finance_tutorial_completed_v1', 'true');
    const demoProfile = {
      user: { name: 'Operative Lead', age: 28, country: 'India', currency: 'INR' },
      income: { monthlySalary: 125000, otherIncome: 15000 },
      expenses: {
        fixed: {
          rent: 28000,
          utilities: 4500,
          internet: 1200,
          phone: 800,
          insurance: 3500,
          emi: 7500,
          subscriptions: 1500,
          transportation: 4500,
          education: 0,
          other: 0,
        },
        variable: {
          food: 8500,
          shopping: 4000,
          entertainment: 3500,
          travel: 2000,
          miscellaneous: 1500,
        },
      },
      position: {
        currentSavings: 350000,
        emergencyFund: 200000,
        existingInvestments: 650000,
        debt: { outstandingLoans: 0, creditCardDebt: 0 },
      },
      priorities: ['Emergency fund', 'Wealth creation', 'Tactical strike'],
      riskPreference: 'aggressive',
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem('finance_os_profile_v1', JSON.stringify(demoProfile));
  });

  // Reload page to apply state cleanly
  await page.reload({ waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1500));

  const tabs = [
    { id: 'dashboard', name: 'real_dashboard.png' },
    { id: 'cashflow', name: 'real_cashflow.png' },
    { id: 'missions', name: 'real_missions.png' },
    { id: 'assets', name: 'real_assets.png' },
    { id: 'insights', name: 'real_insights.png' },
    { id: 'advisor', name: 'real_advisor.png' },
  ];

  const screenshotsDir = path.resolve(__dirname, '../public/screenshots');

  for (const tab of tabs) {
    console.log(`Navigating to tab: ${tab.id}...`);
    // Click navigation button in sidebar
    await page.evaluate((tabId) => {
      const buttons = Array.from(document.querySelectorAll('aside nav button'));
      const target = buttons.find((b) => b.textContent?.toLowerCase().includes(tabId));
      if (target) {
        target.click();
      }
    }, tab.id);

    // Give animations, svg charts, and cards 1.5s to render completely
    await new Promise((r) => setTimeout(r, 1500));

    const outputPath = path.join(screenshotsDir, tab.name);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Saved screenshot: ${tab.name}`);
  }

  await browser.close();
  console.log('All real site screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
