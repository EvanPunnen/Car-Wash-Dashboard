# Mr. DODO - Mobile & Web Billing App 🚗💨
**Premium Detailing & Car Wash Invoice Generator**

A mobile-first Progressive Web App (PWA) and responsive desktop billing workstation built specifically for **Mr. DODO PREMIUM DETAILING & CAR WASH**, generating pixel-perfect A4 bills matching the exact typography, layout, geometric emblem logo, and formatting of your official invoices.

---

## 🌟 Key Updates & Features

### 1. 🎨 Refined Invoice Design & Spacing
- **Enlarged Logo**: The geometric emblem and wordmark have been scaled up for stronger visual prominence.
- **Uncluttered Vehicle Details**: Generous horizontal spacing between Customer info and Vehicle Registration / Make so nothing feels cramped.
- **Refined Table Spacing**: Increased row padding (`py-3.5`) in the description table.
- **Balanced Typography**: Stark black boldness has been softened to clean semi-bold and medium weights matching the original PDF.

### 2. 🚗 Smart Car Maker & Model Suggestions
- Instant brand filter chips: **Toyota**, **Mahindra**, **Hyundai**, **Tata**, **Kia**, **Maruti Suzuki**, **VW / Skoda**, **Honda**, and **Luxury German Brands (BMW, Mercedes, Audi)**.
- 1-tap model suggestions (e.g. *Toyota Hyryder, Innova Hycross, Fortuner, Mahindra Thar, Thar Roxx, XUV700, Scorpio-N, Creta, Safari, Swift, etc.*) automatically populate the input.

### 3. 👥 Manager & User Access System
- Click the Manager pill in the top header to access the **Manager & User Access** page.
- Switch active managers with 1 tap (*Arun Varghese - General Manager*, *Rahul S. - Billing Desk*, *Sanjay Kumar - Detailing Lead*, *Sreejith M. - Car Wash Lead*).
- Add new managers or team members.
- Every bill tracks the manager who issued it.

### 4. ☁️ Google Drive & File Manager Integration (`mrdododetailers@gmail.com`)
- Dedicated Google Drive access page configured for **`mrdododetailers@gmail.com`**.
- Quick action card located directly below the bill sheet:
  - **📁 Save to File Manager**: Direct save to your device storage / files using File System Access.
  - **☁️ Google Drive Sync**: Instant access to your business Google Drive.
  - **📥 Download PDF**: Instant A4 PDF file generation.
  - **💬 WhatsApp Bill**: Send a formatted receipt directly to the customer.

### 5. 🚘 Automatic Vehicle-Based File Naming
- PDFs are named by vehicle number, make, and date:
  ```
  KL-05-BE-6091_Toyota-Hyrider_2026-03-07.pdf
  ```
- Easy to search, catalog, and locate in your phone's File Manager or Google Drive.

### 6. 📅 Date-Based Storage & Past Bill Editing
- In the **History** tab, bills are chronologically grouped by date (*Today*, *Yesterday*, *7 March 2026*, etc.).
- Tap **Edit** on any bill to load it directly back into the editor and update services, amounts, or notes.
- Tap **Duplicate** to quickly generate a new bill for a returning vehicle.

### 7. 💻 Web & Mobile Compatibility
- **Desktop / Laptop**: Includes a **Split Screen** mode toggle showing the Live Form on the left and the Live A4 Sheet on the right for rapid workstation billing.
- **Mobile**: Touch-friendly bottom navigation bar, fit-to-screen A4 auto-scaler, and standalone PWA installation.
- **Custom App Icon**: Features the Mr. DODO geometric mark on high-contrast luxury dark background.

---

## 📱 How to Run & Install on Mobile

1. **Start the local server**:
   ```powershell
   npm run dev -- --host
   ```
2. **Open on your mobile phone**:
   - Connect phone to the same Wi-Fi network.
   - Open the displayed `http://<YOUR-IP>:5173` in Safari or Chrome.
3. **Install as App (Add to Home Screen)**:
   - **iPhone (Safari)**: Tap Share $\rightarrow$ **Add to Home Screen**.
   - **Android (Chrome)**: Tap Menu (three dots) $\rightarrow$ **Install App** or **Add to Home Screen**.
