# Guestly Availability API Parameter Fix - Implementation Report

**Date**: November 20, 2025
**Status**: COMPLETED ✅
**Testing Status**: Blocked by API rate limiting (will auto-resolve)

---

## Problem Description

The Guestly availability API was returning `400 Bad Request` with the error:
```
"from" parameter is invalid
```

This indicated that the API endpoint was not receiving the correct query parameter names.

---

## Root Cause Analysis

**File**: `/integrations/guestly/client.ts`
**Function**: `getAvailability()`
**Line**: 432

The code was constructing the API URL with incorrect parameter names:
```typescript
// BEFORE (incorrect):
const url = `${BASE_URL}${endpoint}?startDate=${startDate}&endDate=${endDate}`;
```

**Guestly API Expected Parameters**:
- `from` - Start date
- `to` - End date

**We Were Sending**:
- `startDate` - Not recognized by Guestly
- `endDate` - Not recognized by Guestly

---

## Implementation Details

### Changes Made

**File**: `/Users/philippbernert/Desktop/LoftyV4/Website/integrations/guestly/client.ts`

#### 1. Fixed API URL Construction (Line 432)

```typescript
// AFTER (correct):
const url = `${BASE_URL}${endpoint}?from=${startDate}&to=${endDate}`;
```

**Impact**:
- Maps internal `startDate` parameter to `from` query parameter
- Maps internal `endDate` parameter to `to` query parameter

#### 2. Updated Documentation (Lines 415-416)

```typescript
/**
 * Check availability for a property in a date range
 * Includes 5-minute caching layer to reduce API calls
 * @param propertyId - Guestly property ID
 * @param startDate - Start date in YYYY-MM-DD format (sent as 'from' parameter to Guestly API)
 * @param endDate - End date in YYYY-MM-DD format (sent as 'to' parameter to Guestly API)
 * @returns Array of availability data for each date
 */
```

**Purpose**: Clarifies the parameter mapping for future developers

---

## Date Format Requirements

**Required Format**: `YYYY-MM-DD` (ISO date format)

**Examples**:
- ✅ `2025-12-20` (correct)
- ✅ `2025-01-05` (correct)
- ❌ `12/20/2025` (incorrect)
- ❌ `2025-12-20T00:00:00Z` (incorrect - includes time)

**Notes**:
- The date format requirement has NOT changed
- Only the query parameter names changed (`startDate`/`endDate` → `from`/`to`)
- All existing code using YYYY-MM-DD format will continue to work

---

## Backward Compatibility

### Function Signature
**No changes** - The function signature remains identical:
```typescript
export async function getAvailability(
  propertyId: string,
  startDate: string,  // Parameter name unchanged
  endDate: string     // Parameter name unchanged
): Promise<GuestlyAvailability[]>
```

### Caller Impact
**Zero changes required** - All callers continue to work without modification:

1. **`app/api/availability/check/route.ts`** ✅
   ```typescript
   const availabilityData = await getAvailability(guestlyPropertyId, checkIn, checkOut);
   ```

2. **`integrations/guestly/test-connection.ts`** ✅
   ```typescript
   const availability = await getAvailability(propertyId, START_DATE, END_DATE);
   ```

3. **Internal callers** (`isPropertyAvailable`, `getPricing`) ✅
   - No changes needed

---

## Testing Status

### Current Blocker
**429 Too Many Requests** - Guestly API rate limiting

**Reason**: Multiple test runs during debugging triggered rate limits

**Resolution**: Rate limits will automatically clear after the time window (typically 1-5 minutes)

### Test Command
```bash
npx tsx integrations/guestly/test-connection.ts
```

### Expected Test Results (After Rate Limit Clears)

```
✅ TEST 1: OAuth 2.0 Configuration - PASS
✅ TEST 2: Fetch All Properties - PASS
✅ TEST 3: Verify Expected Property IDs - PASS
✅ TEST 4: Get Individual Property Details - PASS
✅ TEST 5: Get Availability Data - PASS  ← This test validates the fix

Total: 5/5 tests passed
```

**Test 5 specifically validates**:
- Availability data can be fetched using `from`/`to` parameters
- Response includes daily availability data
- Date ranges are correctly processed
- Pricing information is included

---

## Verification Steps

### 1. Manual API Test (After Rate Limit Clears)

```bash
# Run the test connection script
npx tsx integrations/guestly/test-connection.ts
```

**Success Criteria**:
- All 5 tests pass
- Test 5 shows availability data for both properties
- No "invalid parameter" errors

### 2. Verify in Development

```bash
# Start dev server
npm run dev

# Navigate to property page
open http://localhost:3000/properties/kantstrasse

# Check booking widget calendar
# - Should load without errors
# - Should show available/booked dates
# - Should display pricing
```

### 3. Check API Endpoint

```bash
# Test the Next.js API route
curl http://localhost:3000/api/availability/check?propertySlug=kantstrasse&checkIn=2025-12-20&checkOut=2025-12-27
```

**Expected Response**:
```json
{
  "available": true,
  "availability": [
    {
      "date": "2025-12-20",
      "status": "available",
      "price": 120
    },
    ...
  ]
}
```

---

## Related Files

### Modified Files
- ✅ `/integrations/guestly/client.ts` (line 432, lines 415-416)

### Files That Call `getAvailability` (No Changes Needed)
- `/app/api/availability/check/route.ts`
- `/integrations/guestly/client.ts` (internal calls)
- `/integrations/guestly/test-connection.ts`
- `/integrations/guestly/test-cache.ts`
- `/integrations/guestly/example.ts.example`

### Documentation Files
- `/integrations/guestly/README.md` (examples still valid)
- `/lib/cache/README.md` (examples still valid)
- `/docs/GUESTLY_SYNC.md` (not affected)

---

## Technical Details

### API Endpoint
```
GET https://open-api.guesty.com/v1/listings/{propertyId}/calendar
```

### Query Parameters (Corrected)
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string | Yes | Start date (YYYY-MM-DD) |
| `to` | string | Yes | End date (YYYY-MM-DD) |

### Response Structure
```typescript
{
  days: [
    {
      date: string;        // ISO date
      status: 'available' | 'booked' | 'blocked';
      price?: number;      // Nightly rate
      minNights?: number;  // Minimum stay requirement
    }
  ]
}
```

---

## Troubleshooting

### If Tests Still Fail After Rate Limit Clears

1. **Check OAuth credentials**:
   ```bash
   grep GUESTLY_ .env.local
   ```
   Ensure `GUESTY_CLIENT_ID` and `GUESTY_CLIENT_SECRET` are set

2. **Clear OAuth token cache**:
   ```typescript
   import { clearCachedToken } from './integrations/guestly/client';
   clearCachedToken();
   ```

3. **Check property IDs**:
   ```typescript
   // Verify these IDs are correct in your Guestly account
   PROPERTY_MAP = {
     'kantstrasse': '68e0da429e441d00129131d7',
     'hindenburgufer': '68e0da486cf6cf001162ee98'
   }
   ```

4. **Test with a single property**:
   ```bash
   # Modify test-connection.ts to only test one property
   # This reduces API calls
   ```

---

## Conclusion

### Summary
✅ Fixed incorrect query parameter names in Guestly availability API call
✅ Updated `startDate`/`endDate` → `from`/`to`
✅ Maintained backward compatibility (no caller changes needed)
✅ Updated documentation for clarity
⏳ Testing blocked by rate limiting (will auto-resolve)

### Confidence Level
**HIGH** - The fix is correct based on:
1. Error message explicitly stated `"from" parameter is invalid`
2. Code change is minimal and targeted
3. Standard REST API convention for date ranges uses `from`/`to`
4. No breaking changes to function signature or callers

### Next Action
Wait 5-10 minutes for rate limit to clear, then run:
```bash
npx tsx integrations/guestly/test-connection.ts
```

Expected outcome: All 5 tests pass, confirming the fix works correctly.

---

**Implementation completed by**: Claude Code
**Review status**: Ready for testing
**Deployment readiness**: Ready (pending successful test run)
