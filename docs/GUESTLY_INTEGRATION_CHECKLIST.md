# Guestly Integration Checklist

## 📋 Complete this checklist to enable smooth Guestly integration

Please fill out all sections below and provide this information to Claude for implementation.

---

## 1. 🔑 API Credentials & Access

### A. Guestly API Key
**What:** Your Guestly API authentication token
**Where to find it:**
1. Log into your Guestly account at https://app.guesty.com
2. Navigate to: **Settings** → **API & Webhooks** → **Open API**
3. Click **"Generate New Token"** or copy existing token
4. Give it a name like "Loftly Website Integration"

**Required Permissions (ensure these are enabled):**
- ✅ Read Listings/Properties
- ✅ Read Reservations
- ✅ Create Reservations
- ✅ Update Reservations
- ✅ Read Calendar/Availability
- ✅ Update Calendar/Availability

**API Key:**
```
Paste your Guestly API key here: 

zCJMNC5qGcEWJ8ByX25d95YhdXnnJga1SF-8y0wM8JhaFlkixOhf6D4U9MMUYJcU

```

### B. Account Type Confirmation
Which Guesty platform are you using?

- [x ] **Guesty** (main platform) - https://app.guesty.com
- [ ] **Guesty For Hosts** - https://app.guestyforhosts.com

**Note:** Different platforms have different API endpoints:
- Guesty: `https://open-api.guesty.com/v1`
- Guesty For Hosts: `https://api.guestyforhosts.com/v1`

---

## 2. 🏠 Property Mapping

Map your website properties to Guestly property IDs.

### How to Find Guesty Property IDs:
1. Log into Guesty
2. Go to **Listings** → Select a property
3. Look at the URL: `https://app.guesty.com/listings/PROPERTY_ID_HERE`
4. Or go to **Settings** → **API** and use the test endpoint to list all properties

### Property Mappings:

#### Property 1: Kantstraße
- **Website Property ID:** `kantstrasse`
- **Guesty Property ID:** `68e0da429e441d00129131d7`
- **Property Name in Guesty:** `kant99`

#### Property 2: Hindenburgufer
- **Website Property ID:** `hindenburgufer`
- **Guesty Property ID:** `68e0da486cf6cf001162ee98`
- **Property Name in Guesty:** `Hindenburgdamm 85`

#### Additional Properties (if any):
```
Website ID: _____________ → Guesty ID: _____________
Website ID: _____________ → Guesty ID: _____________
```

---

## 3. 🔄 Integration Features & Behavior

Select which features you want enabled:

### A. Real-Time Availability Checking
When a guest views the booking calendar on your website:

- [ x] **YES** - Check Guestly in real-time for available dates (recommended)
- [ ] **NO** - Use local database only

**If YES, how often should we cache availability data?**
- [ ] No caching (always fresh, but slower)
- [ x] Cache for 5 minutes (recommended)
- [ ] Cache for 15 minutes
- [ ] Cache for 1 hour

### B. Booking Synchronization Direction

When a booking is made on YOUR website:
- [x ] **Create booking in Guestly immediately** (recommended)
- [ ] **Create after payment confirmation only**
- [ ] **Manual sync only**

When a booking is made in GUESTLY or other channels:
- [x ] **Sync to website database automatically** (recommended)
- [ ] **Display on calendar only, don't create booking record**
- [ ] **Manual sync only**

### C. What Information to Sync to Guestly

When creating a booking in Guestly, send:
- [x ] Guest first name
- [x ] Guest last name
- [x ] Guest email
- [x ] Guest phone number
- [x ] Number of adults
- [x ] Number of children
- [x ] Number of infants
- [ x] Special requests/notes
- [x ] Purpose of stay
- [x ] Company name (if provided)
- [x ] Payment status
- [x ] Total amount paid

**Select all that apply**

### D. Booking Status Mapping

Map your website booking statuses to Guesty statuses:

| Your Website Status | Guesty Status | Map to? |
|---------------------|---------------|---------|
| pending (payment not confirmed) | inquiry / confirmed / declined | `not paied` |
| confirmed (payment success) | confirmed | `confirmed` ✅ |
| cancelled | canceled | `canceled` ✅ |
| completed (check-out done) | checked_out | `checked_out` ✅ |

---

## 4. 🚨 Conflict & Error Handling

### A. Double Booking Prevention Strategy

If dates become unavailable in Guestly WHILE a guest is booking:

- [x ] **Option 1 (Recommended):** Block the booking immediately, show error: "These dates are no longer available"
- [ ] **Option 2:** Allow booking to continue, notify admin for manual resolution
- [ ] **Option 3:** Put booking in "pending approval" queue

### B. Sync Failure Handling

If Guestly API is down or fails when creating a booking:

- [x ] **Option 1 (Recommended):** Save booking locally, retry sync every 5 minutes, notify admin
- [ ] **Option 2:** Block the booking, show error to guest
- [ ] **Option 3:** Allow booking, mark for manual sync

### C. Notification Preferences

When sync issues occur, notify:
- [ ] Email: `_________________________________`
- [ ] SMS: `_________________________________`
- [ ] Slack webhook: `_________________________________`
- [ ] No notifications (not recommended)

---

## 5. 📅 Calendar & Availability Settings

### A. Blocked Dates Source
Which blocked dates should appear on your website calendar?

- [ ] Guestly reservations only
- [ ] Guestly reservations + manual blocks in Guestly
- [x ] All unavailable dates from Guesty calendar (recommended)

### B. Minimum Stay Rules
- [ x] Use Guestly's minimum stay rules
- [ ] Use website's rules (currently: 3 nights minimum)
- [ ] Use the stricter of the two (recommended)

### C. Check-in/Check-out Times
Do you want to sync Guesty's check-in/check-out times?

- [x ] **YES** - Pull from Guesty
- [ ] **NO** - Use website defaults (Check-in: 3 PM, Check-out: 11 AM)

**If YES, what are your Guesty times?**
- Check-in time: `_____________`
- Check-out time: `_____________`

---

## 6. 💰 Pricing & Fees

### A. Pricing Source
Which pricing should be used on your website?

- [ ] **Website pricing** (current: Kantstraße €120/night, Hindenburgufer €95/night)
- [ x] **Guestly pricing** (pull from Guestly API)
- [ ] **Hybrid:** Base price from Guesty, fees from website

### B. Fees to Include
When syncing to Guestly, which fees should be included?

- [ ] Cleaning fee
- [ ] Pet fee (if applicable)
- [ ] Service fee
- [ ] VAT/taxes
- [x ] All fees combined as one line item (recommended)

---

## 7. 🔔 Webhook Configuration

### A. Guesty Webhooks
To receive real-time updates from Guestly, we'll set up webhooks.

**Webhook URL will be:** `https://your-domain.com/api/webhooks/guestly`

**Events to listen for:**
- [ ] reservation.created
- [ ] reservation.updated
- [ ] reservation.canceled
- [ ] listing.calendar.updated
- [ ] All reservation events (recommended)

### B. Your Domain
What is your production domain?

**Production URL:** `_________________________________`
**Staging URL (if any):** `_________________________________`

---

## 8. 🧪 Testing Requirements

### A. Test Property
Do you have a test/sandbox Guestly account or property for testing?

- [ ] **YES** - Test credentials:
  - Test API Key: `_________________________________`
  - Test Property ID: `_________________________________`
- [x ] **NO** - We'll test carefully on production with safeguards

### B. Test Booking
Can we make a test booking in Guestly to verify the integration?

- [ ] **YES** - Use test dates: `_________________________________`
- [ x] **NO** - We'll use API simulation only

---

## 9. 📊 Reporting & Monitoring

### A. Sync Logging
How detailed should sync logs be?

- [ ] **Detailed** - Log every API call, booking sync, and availability check
- [ ] **Normal** - Log only booking creations and errors (recommended)
- [ ] **Minimal** - Log only errors

### B. Admin Dashboard
Should we add a Guestly sync status to your admin dashboard?

- [ x] **YES** - Show last sync time, sync errors, pending syncs
- [ ] **NO** - Keep it minimal

---

## 10. 🎯 Implementation Priority

Number these in order of priority (1 = highest):

- [1 ] `` Real-time availability checking
- [1 ] `___` Sync bookings from website to Guestly
- [1 ] `___` Sync bookings from Guestly to website
- [1 ] `___` Block dates from Guestly reservations
- [1 ] `___` Webhook setup for real-time updates
- [ 2] `___` Admin sync status dashboard

---

## 11. ✅ Final Checklist

Before implementation, confirm you have:

- [x ] Guestly API key with required permissions
- [ x] All property IDs mapped correctly
- [ x] Decided on conflict handling strategy
- [ x] Confirmed pricing source
- [ x] Provided production domain
- [ x] Set up notification email/SMS
- [ x] Tested API access (can retrieve properties from Guestly)

---

## 📤 How to Submit This Information

**Option 1:** Fill out this document and save it, then tell Claude: "I've filled out the checklist"

**Option 2:** Copy and paste the filled-out information directly in the chat

**Option 3:** Share the required credentials via secure method and reference this file

---

## 🚀 What Happens Next

Once you provide this information, I will:

1. ✅ Create Guestly API client (`integrations/guestly/client.ts`)
2. ✅ Set up environment variables securely
3. ✅ Implement real-time availability checking
4. ✅ Create booking sync logic (website → Guestly)
5. ✅ Create reverse sync (Guestly → website)
6. ✅ Set up webhook endpoints
7. ✅ Add error handling and retry logic
8. ✅ Create admin dashboard for sync monitoring
9. ✅ Test the integration end-to-end
10. ✅ Deploy with monitoring

**Estimated implementation time:** 2-3 hours once all information is provided

---

## 📞 Questions?

If you're unsure about any section, please ask! It's better to clarify now than to need changes later.

**Common questions:**

**Q: Do I need a paid Guesty plan for API access?**
A: API access is typically available on Professional and Enterprise plans. Check with Guesty support.

**Q: Will this affect my existing bookings?**
A: No, existing bookings will remain untouched. We only sync new bookings going forward.

**Q: Can I test the integration before going live?**
A: Yes! We'll implement staging mode and test thoroughly before enabling on production.

**Q: What if the Guestly API goes down?**
A: Bookings will still save to your database, and we'll retry syncing automatically when the API is back online.

---

**Last updated:** 2025-11-19
**For:** Loftly V4 Website - Guestly Integration
**Status:** Awaiting information from property manager
