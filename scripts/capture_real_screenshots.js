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
    localStorage.setItem('finance_os_reset_uptill_now_v1', 'true');
    localStorage.setItem('finance_tutorial_completed_v1', 'true');
    sessionStorage.setItem('finance_os_session_unlocked_v1', 'true');
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
    const demoMissions = [
      {
        id: 'mission-01',
        missionCode: 'MISSION 0042',
        name: 'Tactical Hardware Vault',
        description: 'High-performance workstation upgrade and tactical gear',
        category: 'Technology',
        targetAmount: 150000,
        initialAmount: 40000,
        currentAmount: 95000,
        targetDate: '2027-02-01',
        isAsap: false,
        monthlyContribution: 12000,
        priority: 'high',
        status: 'on_track',
        isArchived: false,
        createdAt: '2026-08-01T10:00:00Z',
        updatedAt: '2026-09-09T12:00:00Z',
      },
      {
        id: 'mission-02',
        missionCode: 'MISSION 0010',
        name: 'Emergency Reserve Fortress',
        description: '6 months of liquid essential expense buffer',
        category: 'Emergency Fund',
        targetAmount: 250000,
        initialAmount: 100000,
        currentAmount: 160000,
        targetDate: '2027-06-01',
        isAsap: false,
        monthlyContribution: 15000,
        priority: 'high',
        status: 'on_track',
        isArchived: false,
        createdAt: '2026-07-01T10:00:00Z',
        updatedAt: '2026-09-01T10:00:00Z',
      },
    ];
    localStorage.setItem('finance_os_missions_v1', JSON.stringify(demoMissions));
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
    { id: 'walkthrough', name: 'real_walkthrough.png' },
  ];

  const screenshotsDir = path.resolve(__dirname, '../public/screenshots');

  for (const tab of tabs) {
    console.log(`Navigating to tab: ${tab.id}...`);
    // Click navigation button in sidebar using data-tab-id or robust text matching
    await page.evaluate((tabId) => {
      const target =
        document.querySelector(`button[data-tab-id="${tabId}"]`) ||
        Array.from(document.querySelectorAll('aside nav button')).find((b) =>
          b.textContent?.toLowerCase().replace(/\s+/g, '').includes(tabId.replace(/\s+/g, ''))
        );
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
