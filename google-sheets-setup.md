# Google Sheets Payment Sync - Setup Guide

## Step 1: Create a Google Sheet

1. Go to https://sheets.google.com (login with **muhammedadnan50007@gmail.com**)
2. Create a new blank spreadsheet
3. Name it: **"Wintrix Academy - Payment Records"**
4. In **Row 1**, add these column headers:

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Receipt No | Student Name | Phone | Amount | Payment Mode | Purpose | Description | Installment | Total Fee | Paid So Far | Remaining | Recorded By | Date & Time |

## Step 2: Add the Script

1. In the same spreadsheet, go to **Extensions → Apps Script**
2. Delete any existing code and paste the following:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.receiptNo,
      data.studentName,
      data.studentPhone,
      data.amount,
      data.paymentMode,
      data.purpose,
      data.description || "",
      data.installmentNo || "Full",
      data.totalFee || data.amount,
      data.paidSoFar || data.amount,
      data.remainingBalance || 0,
      data.recordedBy,
      data.date + " " + data.time
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Save** (Ctrl+S)
4. Name the project: "Payment Sync"

## Step 3: Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type" → choose **Web app**
3. Set these options:
   - Description: "Payment sync webhook"
   - Execute as: **Me (muhammedadnan50007@gmail.com)**
   - Who has access: **Anyone**
4. Click **Deploy**
5. Click **Authorize access** → choose your Google account → Allow
6. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/AKfycb.../exec`)

## Step 4: Add URL to Your Website

1. Open your `.env` file at `/home/madnan/Desktop/sucesss/dcet-coaching/.env`
2. Add this line (paste your copied URL):

```
GOOGLE_SHEET_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

3. Restart your dev server (`npm run dev`)

## Done!

Now every payment you record will automatically appear in your Google Sheet within seconds.

### What gets synced to Excel/Sheets:
- Receipt Number
- Student Name & Phone
- Amount Paid
- Payment Mode (Cash/UPI/Bank)
- Purpose (Admission/Monthly/Material)
- Installment Number
- Total Fee
- Paid So Far
- Remaining Balance
- Who Recorded It
- Date & Time

### Tips:
- You can download the sheet as Excel (.xlsx) anytime
- You can add filters/sorting in the sheet
- If server goes down, all past records are safe in the sheet
- You can share the sheet with others for viewing
