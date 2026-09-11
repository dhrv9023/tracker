# 🏦 FINANCE OS — Complete User Guide (Hinglish Manual)

> **Money-Heist Inspired Personal Financial Command Center**  
> Simple, powerful, private aur deterministic personal finance tracker with Gemini AI intelligence.

---

## 📌 Table of Contents
1. [Platform Kya Hai? (Overview)](#1-platform-kya-hai-overview)
2. [Quick Start — 1 Minute Setup](#2-quick-start--1-minute-setup)
3. [00 // Security Gateway — Master Passcode](#3-00--security-gateway--master-passcode)
4. [01 // Command Center — Cockpit Overview](#4-01--command-center--cockpit-overview)
5. [02 // Cash Flow — Income, Kharcha & Budgets](#5-02--cash-flow--income-kharcha--budgets)
6. [03 // Missions — Goals & Sapne Track Karna](#6-03--missions--goals--sapne-track-karna)
7. [04 // Assets — Investments & SIP Compounding](#7-04--assets--investments--sip-compounding)
8. [05 // Insights — Health Score & Spending Leaks](#8-05--insights--health-score--spending-leaks)
9. [06 // Advisor — Gemini AI Financial Coach](#9-06--advisor--gemini-ai-financial-coach)
10. [07 // Settings — Security & Data Backup](#10-07--settings--security--data-backup)
11. [Vercel Par Deploy Kaise Karein (Live Hosting)](#11-vercel-par-deploy-kaise-karein-live-hosting)
12. [Keyboard Shortcuts & Tips](#12-keyboard-shortcuts--tips)

---

## 1. Platform Kya Hai? (Overview)

**Finance OS** ek full-featured personal finance command center hai jise Money-Heist tactical aesthetic ke saath design kiya gaya hai. 

### Iske 3 Main Rules:
1. **100% Privacy (Zero Cloud Leakage)**: Aapka data kisi third-party server par nahi jaata. Sab kuch aapke apne browser storage (`localStorage`) mein Web Crypto SHA-256 se secure rehta hai.
2. **Accurate Math (No AI Hallucinations)**: Surplus, SIP interest, aur goal completion timelines pure mathematics se calculate hote hain, AI se guess nahi karwaye jaate.
3. **Actionable AI (Gemini)**: AI sirf qualitative guidance, deep reviews, aur advice deta hai — calculate platform khud karta hai.

---

## 2. Quick Start — 1 Minute Setup

### Local Run Kaise Karein:
```bash
# 1. Project folder mein dependencies install karein
npm install

# 2. Local dev server start karein
npm run dev

# 3. Browser mein open karein:
http://localhost:5173
```

---

## 3. 00 // Security Gateway — Master Passcode

Platform ko kholte hi aapko secure **Master Passcode** gate milta hai taaki koi dusra aapka financial data na dekh sake.

### Kaise Kaam Karta Hai:
- **Pehli Baar (Setup)**: Aapse 4+ digit ka secret passcode set karne ko kahega (Example: `4499` ya `tokyo-heist`).
- **30 Days Remember Me**: Agar tick karoge toh us device par 30 din tak bar-bar password nahi mangega.
- **Lock Anytime**: Top bar mein `[ 🔒 Lock ]` button dabao, terminal instantly lock ho jayega.
- **Brute-Force Protection**: Agar koi 5 baar galat passcode daalega, toh system 30 seconds ke liye freeze ho jayega.

---

## 4. 01 // Command Center — Cockpit Overview

Ye aapka main dashboard hai jo screen ki full width use karta hai.

### Dashboard ke Main Cards:
1. **Total Monthly Inflow**: Har mahine aane wala total paisa (Salary + Freelance/Other).
2. **Total Liquid Reserves**: Emergency fund aur savings account mein pada cash (saath mein dikhayega kitne mahine ka kharcha chal sakta hai).
3. **Monthly Outflow**: Fixed (Rent, EMI, Bills) + Variable (Food, Shopping) kharche.
4. **Net Capital Surplus**: Sab kharche nikaalne ke baad bacha hua real paisa jo invest ya save ho sakta hai.

### Example Scenario:
> **Maan lo:**  
> - Aapki Salary: **₹1,25,000**  
> - Total Kharche (Rent + EMI + Khana): **₹71,000**  
> - 👉 **Net Capital Surplus** = **₹54,000** bachega.  
> Dashboard ke 12-month projection chart mein aapko saaf dikhega ki 1 saal baad aapke paas kitna surplus accumulate hoga.

---

## 5. 02 // Cash Flow — Income, Kharcha & Budgets

Yahan aap apne daily transactions aur category budgets control karte ho.

### A. Transaction Add Karna:
- Top-right par `+ Add Transaction` click karein.
- Type select karein (`Expense` ya `Income`).
- Category select karein (e.g. `Food`, `Shopping`, `Travel`, `Utilities`).
- Amount daalein aur date select karein.
- *Example:* ₹850 Zomato dinner add kiya -> Food category ka bar chart automatically update ho jayega.

### B. Category Budget Limits:
- Har category ke liye monthly limit set kar sakte ho.
- *Example:* Food ke liye limit rakhi **₹10,000**. Agar kharcha ₹8,500 ho gaya, toh indicator **Yellow** alert dega. ₹10,000 cross hote hi **Crimson Red Warning** aayegi.

---

## 6. 03 // Missions — Goals & Sapne Track Karna

Apne financial targets ko game missions ki tarah track karein.

### Mission Create Karne Ka Example:
1. **Mission Name**: `MacBook Pro M3 Max`
2. **Target Amount**: `₹1,80,000`
3. **Target Date**: 6 mahine baad (e.g. March 2027)
4. **Initial Amount**: `₹30,000` (jo already save hain)

### System Kya Batayega:
- **Remaining Amount**: ₹1,50,000
- **Required Monthly Saving**: ₹25,000 / month
- **Feasibility Check**:
  - Agar surplus ₹54,000 hai, toh mission status hoga: `COMFORTABLE` (Aap aaram se afford kar sakte ho).
  - Agar surplus sirf ₹20,000 hota, toh status hota: `TIGHT / OVER-BUDGET` aur system aapko timeline extend karne ki advice deta.

### Capital Deploy Karna:
Jab bhi savings se mission mein paisa jama karna ho, `[ Deploy Capital ]` dabayein aur amount daalein. Progress bar real-time aage badh jayegi!

---

## 7. 04 // Assets — Investments & SIP Compounding

Yahan aap apne long-term investments (Mutual Funds, Stocks, Gold, FD, Crypto) manage karte hain.

### A. Holdings Add Karna:
- `+ Add Asset Holding` click karein.
- Asset class choose karein (e.g. `Equity Index Funds`, `Sovereign Gold Bonds`, `Real Estate`).
- Invested amount aur current value daalein.

### B. SIP Compounding Calculator:
- **Monthly SIP**: ₹15,000
- **Expected Annual Return**: 12%
- **Time Period**: 10 saal
- 👉 **Result**: 
  - Invested Capital: **₹18,00,000**
  - Estimated Wealth Gain: **₹16,85,000**
  - **Total Maturity Value: ₹34,85,000!**

---

## 8. 05 // Insights — Health Score & Spending Leaks

Aapki financial health ka automated audit report:

1. **Financial Health Score (0–100)**:
   - **80–100 (Elite)**: Strong surplus, 6+ months emergency reserve, low debt.
   - **60–79 (Stable)**: Decent savings rate, basic emergency cover.
   - **Below 60 (Critical)**: Kharche zyada hain ya emergency runway 2 mahine se kam hai.
2. **Spending Leak Detector**: Agar kisi un-planned category mein sudden spike aayi hai, system turant flag karega.
3. **Monthly Review**: Gemini AI se 1-click tactical monthly debrief generate kar sakte ho.

---

## 9. 06 // Advisor — Gemini AI Financial Coach

Ye aapka private financial advisor hai. Ye aapke pre-calculated numbers ko scan karke direct practical answers deta hai.

### Sample Prompts Jo Aap Pooch Sakte Ho:
- *"Mera monthly surplus ₹54,000 hai. Mujhe 6 mahine mein emergency fund complete karna hai ya SIP start karni chahiye?"*
- *"Kya main ₹45,000 ka international trip abhi plan kar sakta hoon bina meri MacBook mission ko delay kiye?"*
- *"Mere fixed expenses salary ka 55% le rahe hain, isko reduce karne ke top 2 steps kya hain?"*

> **Note**: Gemini aapke data ko kabhi distort ya change nahi karta, sirf solid logic ke saath recommendation deta hai.

---

## 10. 07 // Settings — Security & Data Backup

1. **Security & Passcode**:
   - Master Passcode change karna ya terminal turant lock karna.
2. **Baseline Re-Initialization**:
   - Agar salary badh gayi ya rent change ho gaya, toh onboarding wizard re-open karke baseline values update karein.
3. **JSON Backup & Restore**:
   - `Export JSON Backup`: Ek click mein aapka poora financial snapshot encrypted download ho jayega.
   - `Import Backup`: Dusre device ya browser mein backup upload karke turant restore karein.
4. **Purge All Data**:
   - Pure privacy ke liye local storage ko completely zero wipe-out karna.

---

## 11. Vercel Par Deploy Kaise Karein (Live Hosting)

Aap is app ko Vercel par bina kisi cost ke 2 minute mein live host kar sakte ho:

### Step 1: GitHub Push
```bash
git add .
git commit -m "deploy: ready for vercel"
git push origin main
```

### Step 2: Vercel Setup
1. [vercel.com](https://vercel.com) par login karein aur **"Add New Project"** select karein.
2. Apna GitHub repository (`tracker`) import karein.
3. **Framework Preset**: `Vite` (automatically detect ho jayega).

### Step 3: Environment Variables (Optional)
Vercel dashboard mein **Settings -> Environment Variables** par jayein:
- `GEMINI_API_KEY`: Aapki Google Gemini API key (serverless proxy ke zariye safe rahegi).
- `VITE_APP_PASSWORD`: (Optional) Agar aap hardcoded fixed master passcode chahte ho.

### Step 4: Deploy
- **Deploy** button click karein! 1 minute ke andar aapki personal live URL (`https://your-app.vercel.app`) taiyaar ho jayegi.

---

## 12. Keyboard Shortcuts & Tips

| Action | Shortcut / Click | Description |
| :--- | :--- | :--- |
| **Open Navigation Drawer** | Click `[ ☰ MENU ]` | Smooth slide-out menu open hoga |
| **Close Navigation Drawer** | Press `ESC` or click backdrop | Drawer smoothly hide ho jayega |
| **Quick Lock Terminal** | Click `[ 🔒 Lock ]` in TopBar | Turant Level-0 passcode lock screen active |
| **Back Button** | Click `[ ← Back ]` | Pichle screen par return ho jayein |
| **Fast View Switching** | Tabs `01` to `08` | Drawer mein direct number tags se switch karein |

---

**FINANCE OS // COMMAND TERMINAL** — *Stay Disciplined, Build Wealth, Secure The Vault.* 🎖️
