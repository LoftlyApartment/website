# Guestly API Integration

Official integration with Guestly's Open API for property management and reservations.

## Overview

This client provides a complete TypeScript interface to interact with Guestly's Open API, enabling property management, availability checking, and reservation handling.

- **Base URL**: `https://open-api.guesty.com/v1`
- **Authentication**: Bearer token using API key
- **API Documentation**: https://open-api.guesty.com/v1

## Setup

### 1. Environment Configuration

Add your Guestly API key to your environment variables:

```bash
# .env or .env.local
GUESTLY_API_KEY=your-guestly-api-key-here
```

Get your API key from: https://app.guesty.com/settings/api

### 2. Property Mappings

The following properties are currently configured (hardcoded):

```typescript
{
  'kantstrasse': '68e0da429e441d00129131d7',
  'hindenburgufer': '68e0da486cf6cf001162ee98'
}
```

## Usage Examples

### Import the Client

```typescript
import guestyClient from '@/integrations/guestly';

// Or import specific functions
import {
  getProperties,
  getProperty,
  getAvailability,
  createReservation
} from '@/integrations/guestly';
```

### 1. Fetch All Properties

```typescript
async function fetchAllProperties() {
  try {
    const properties = await guestyClient.getProperties();

    console.log(`Found ${properties.length} properties`);
    properties.forEach(property => {
      console.log(`- ${property.title} (ID: ${property._id})`);
    });

    return properties;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}
```

### 2. Get Single Property Details

```typescript
async function getPropertyDetails(propertyId: string) {
  try {
    const property = await guestyClient.getProperty(propertyId);

    console.log('Property Details:');
    console.log(`Title: ${property.title}`);
    console.log(`Address: ${property.address?.full}`);
    console.log(`Bedrooms: ${property.bedrooms}`);
    console.log(`Accommodates: ${property.accommodates} guests`);
    console.log(`Base Price: ${property.prices?.basePrice} ${property.prices?.currency}`);

    return property;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
}

// Using friendly property key
async function getKantstrasse() {
  return await guestyClient.getPropertyByKey('kantstrasse');
}
```

### 3. Check Availability

```typescript
async function checkAvailability() {
  try {
    const propertyId = guestyClient.getPropertyId('kantstrasse');
    const startDate = '2025-12-01';
    const endDate = '2025-12-07';

    // Get detailed availability for each day
    const availability = await guestyClient.getAvailability(
      propertyId,
      startDate,
      endDate
    );

    console.log('Availability:');
    availability.forEach(day => {
      console.log(`${day.date}: ${day.status} - Price: ${day.price}`);
    });

    // Or just check if available
    const isAvailable = await guestyClient.isPropertyAvailable(
      propertyId,
      startDate,
      endDate
    );

    console.log(`Property is ${isAvailable ? 'available' : 'not available'}`);

    return { availability, isAvailable };
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}
```

### 4. Create a Reservation

```typescript
async function createNewReservation() {
  try {
    const reservationData = {
      listingId: guestyClient.getPropertyId('kantstrasse'),
      checkIn: '2025-12-01',
      checkOut: '2025-12-07',
      guestName: 'John Doe',
      guestEmail: 'john.doe@example.com',
      guestPhone: '+49 123 456789',
      numberOfGuests: 2,
      status: 'confirmed' as const,
      money: {
        fareAccommodation: 1200.00,
        currency: 'EUR'
      },
      notes: 'Guest prefers late check-in',
      source: 'Website'
    };

    const reservation = await guestyClient.createReservation(reservationData);

    console.log('Reservation created successfully!');
    console.log(`Reservation ID: ${reservation._id}`);
    console.log(`Confirmation Code: ${reservation.confirmationCode}`);
    console.log(`Status: ${reservation.status}`);

    return reservation;
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}
```

### 5. Update a Reservation

```typescript
async function updateExistingReservation(reservationId: string) {
  try {
    const updates = {
      numberOfGuests: 3,
      notes: 'Updated: Guest bringing additional person'
    };

    const updatedReservation = await guestyClient.updateReservation(
      reservationId,
      updates
    );

    console.log('Reservation updated successfully!');
    console.log(`Number of guests: ${updatedReservation.numberOfGuests}`);

    return updatedReservation;
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
}
```

### 6. Fetch Reservations with Filters

```typescript
async function getUpcomingReservations() {
  try {
    const propertyId = guestyClient.getPropertyId('kantstrasse');
    const today = guestyClient.formatDateForApi(new Date());
    const futureDate = guestyClient.formatDateForApi(
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    );

    const reservations = await guestyClient.getReservations(
      propertyId,
      today,
      futureDate
    );

    console.log(`Found ${reservations.length} upcoming reservations`);

    reservations.forEach(res => {
      console.log(`${res.checkIn} - ${res.checkOut}: ${res.guestName}`);
    });

    return reservations;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
}

// Get all reservations (no filters)
async function getAllReservations() {
  return await guestyClient.getReservations();
}
```

### 7. Cancel a Reservation

```typescript
async function cancelBooking(reservationId: string) {
  try {
    const canceledReservation = await guestyClient.cancelReservation(reservationId);

    console.log('Reservation canceled successfully');
    console.log(`Status: ${canceledReservation.status}`); // Should be 'canceled'

    return canceledReservation;
  } catch (error) {
    console.error('Error canceling reservation:', error);
    throw error;
  }
}
```

## TypeScript Types

All methods are fully typed with TypeScript interfaces:

### GuestlyProperty

```typescript
interface GuestlyProperty {
  _id: string;
  nickname?: string;
  title: string;
  address?: {
    full?: string;
    street?: string;
    city?: string;
    country?: string;
    zipcode?: string;
    lat?: number;
    lng?: number;
  };
  accommodates?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  propertyType?: string;
  roomType?: string;
  amenities?: string[];
  pictures?: Array<{
    _id: string;
    thumbnail?: string;
    regular?: string;
    large?: string;
    caption?: string;
  }>;
  prices?: {
    basePrice?: number;
    currency?: string;
    weeklyPriceFactor?: number;
    monthlyPriceFactor?: number;
  };
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    notes?: string;
  };
  terms?: {
    minNights?: number;
    maxNights?: number;
  };
  active?: boolean;
  listed?: boolean;
}
```

### GuestlyReservation

```typescript
interface GuestlyReservation {
  _id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  status: 'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'declined';
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests?: number;
  money?: {
    fareAccommodation?: number;
    hostPayout?: number;
    totalPaid?: number;
    currency?: string;
  };
  notes?: string;
  source?: string;
  confirmationCode?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### GuestlyAvailability

```typescript
interface GuestlyAvailability {
  date: string;
  status: 'available' | 'booked' | 'blocked';
  price?: number;
  minNights?: number;
}
```

### ReservationData

```typescript
interface ReservationData {
  listingId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  status?: 'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'declined';
  money?: {
    fareAccommodation: number;
    currency?: string;
  };
  notes?: string;
  source?: string;
}
```

## Utility Functions

### Date Validation

```typescript
import { isValidDateFormat, formatDateForApi } from '@/integrations/guestly';

// Check if date string is valid
const isValid = isValidDateFormat('2025-12-01'); // true
const isInvalid = isValidDateFormat('12/01/2025'); // false

// Format Date object for API
const date = new Date();
const formattedDate = formatDateForApi(date); // '2025-11-19'
```

### Property ID Lookup

```typescript
import { getPropertyId, PROPERTY_MAP } from '@/integrations/guestly';

// Get property ID by key
const propertyId = getPropertyId('kantstrasse'); // '68e0da429e441d00129131d7'

// Access all mappings
console.log(PROPERTY_MAP);
// {
//   'kantstrasse': '68e0da429e441d00129131d7',
//   'hindenburgufer': '68e0da486cf6cf001162ee98'
// }
```

## Error Handling

All methods include comprehensive error handling with detailed logging:

```typescript
try {
  const properties = await guestyClient.getProperties();
} catch (error) {
  // Error object contains:
  // - message: Descriptive error message
  // - statusCode: HTTP status code
  // - details: Additional error details from API

  if (error.statusCode === 401) {
    console.error('Authentication failed. Check your API key.');
  } else if (error.statusCode === 404) {
    console.error('Resource not found.');
  } else {
    console.error('API error:', error.message);
  }
}
```

## API Methods Reference

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `getProperties()` | Fetch all properties | None | `Promise<GuestlyProperty[]>` |
| `getProperty(id)` | Get single property | `propertyId: string` | `Promise<GuestlyProperty>` |
| `getPropertyByKey(key)` | Get property by friendly key | `key: PropertyKey` | `Promise<GuestlyProperty>` |
| `getAvailability(id, start, end)` | Check availability | `propertyId: string, startDate: string, endDate: string` | `Promise<GuestlyAvailability[]>` |
| `isPropertyAvailable(id, start, end)` | Boolean availability check | `propertyId: string, startDate: string, endDate: string` | `Promise<boolean>` |
| `getReservations(id?, start?, end?)` | Fetch reservations | `propertyId?: string, startDate?: string, endDate?: string` | `Promise<GuestlyReservation[]>` |
| `getReservation(id)` | Get single reservation | `reservationId: string` | `Promise<GuestlyReservation>` |
| `createReservation(data)` | Create new reservation | `data: ReservationData` | `Promise<GuestlyReservation>` |
| `updateReservation(id, data)` | Update existing reservation | `reservationId: string, data: Partial<ReservationData>` | `Promise<GuestlyReservation>` |
| `cancelReservation(id)` | Cancel reservation | `reservationId: string` | `Promise<GuestlyReservation>` |

## Next Steps

1. Add your Guestly API key to `.env.local`
2. Test the integration in your development environment
3. Import and use the client in your booking flow
4. Implement webhook handlers for real-time updates
5. Add error notifications for failed API calls
6. Set up monitoring for API usage and rate limits

## Support

For API documentation and support:
- API Documentation: https://open-api.guesty.com/v1
- Guestly Support: https://support.guesty.com
- API Settings: https://app.guesty.com/settings/api
