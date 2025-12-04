export interface PropertyAmenity {
  icon: string;
  label: string;
  available: boolean;
}

export interface PropertyReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  content: string;
}

export interface NearbyPlace {
  name: string;
  distance: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  size: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  basePrice: number;
  cleaningFee: number;
  petFee?: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  minStay: number;
  checkInTime: string;
  checkOutTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  petFriendly: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  images: string[];
  description: {
    title: string;
    text: string;
  };
  amenities: string[];
  nearbyPlaces: NearbyPlace[];
  reviews: PropertyReview[];
  rating: number;
  reviewCount: number;
  responseTime: string;
}

export const properties: Record<string, Property> = {
  kantstrasse: {
    id: 'kant',
    slug: 'kantstrasse',
    name: 'Kantstrasse Apartment',
    address: 'Kantstrasse 99, 10627 Berlin',
    coordinates: {
      lat: 52.5065,
      lng: 13.3035,
    },
    size: 90,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 5,
    basePrice: 120,
    cleaningFee: 50,
    weeklyDiscount: 10,
    monthlyDiscount: 20,
    minStay: 3,
    checkInTime: '3:00 PM - 11:00 PM',
    checkOutTime: '11:00 AM',
    quietHoursStart: '10:00 PM',
    quietHoursEnd: '7:00 AM',
    petFriendly: false,
    smokingAllowed: false,
    partiesAllowed: false,
    images: [
      // Bedroom 1
      '/images/kantstrasse/bedroom1-main.jpg',
      '/images/kantstrasse/bedroom1-02.jpg',
      '/images/kantstrasse/bedroom1-03.jpg',
      '/images/kantstrasse/bedroom1-05.jpg',
      '/images/kantstrasse/bedroom1-06.jpg',
      '/images/kantstrasse/bedroom1-07.jpg',
      // Bedroom 2
      '/images/kantstrasse/bedroom2-01.jpg',
      '/images/kantstrasse/bedroom2-02.jpg',
      '/images/kantstrasse/bedroom2-03.jpg',
      '/images/kantstrasse/bedroom2-04.jpg',
      // Living Room
      '/images/kantstrasse/livingroom-01.jpg',
      '/images/kantstrasse/livingroom-02.jpg',
      '/images/kantstrasse/livingroom-03.jpg',
      '/images/kantstrasse/livingroom-04.jpg',
      '/images/kantstrasse/livingroom-05.jpg',
      '/images/kantstrasse/livingroom-06.jpg',
      // Kitchen
      '/images/kantstrasse/kitchen-01.jpg',
      '/images/kantstrasse/kitchen-02.jpg',
      '/images/kantstrasse/kitchen-03.jpg',
      '/images/kantstrasse/kitchen-04.jpg',
      '/images/kantstrasse/kitchen-05.jpg',
      '/images/kantstrasse/kitchen-06.jpg',
      '/images/kantstrasse/kitchen-07.jpg',
      '/images/kantstrasse/kitchen-08.jpg',
      // Bathroom
      '/images/kantstrasse/bathroom-01.jpg',
      '/images/kantstrasse/bathroom-02.jpg',
      '/images/kantstrasse/bathroom-03.jpg',
      '/images/kantstrasse/bathroom-04.jpg',
      '/images/kantstrasse/bathroom-05.jpg',
      // Exterior
      '/images/kantstrasse/exterior-01.jpg',
      '/images/kantstrasse/exterior-02.jpg',
    ],
    description: {
      title: 'Spacious Business & Family Apartment in Charlottenburg',
      text: 'Welcome to our premium 90m² apartment in the heart of Charlottenburg, one of Berlin\'s most prestigious districts. Perfect for business travelers and families, this beautifully furnished apartment offers a dedicated workspace, high-speed WiFi, and all the comforts of home. Located near excellent restaurants, shopping, and public transportation.',
    },
    amenities: [
      'wifi',
      'workspace',
      'kitchen',
      'washer',
      'tv',
      'ac',
      'heating',
      'smoke_detector',
      'first_aid',
      'parking',
    ],
    nearbyPlaces: [
      { name: 'Charlottenburg Palace', distance: '2 km' },
      { name: 'Kurfürstendamm', distance: '1 km' },
      { name: 'Zoo Station', distance: '1.5 km' },
      { name: 'KaDeWe Department Store', distance: '2.5 km' },
      { name: 'Berlin Zoo', distance: '2 km' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Michael S.',
        location: 'Germany',
        rating: 5,
        date: '2024-10-15',
        content: 'Perfect location and spotlessly clean. The workspace was ideal for my business trip. High-speed internet worked flawlessly throughout my stay.',
      },
      {
        id: '2',
        author: 'Sarah L.',
        location: 'United Kingdom',
        rating: 5,
        date: '2024-10-08',
        content: 'Very comfortable for our family stay. Great kitchen and close to everything we needed. The apartment was well-equipped and the host was very responsive.',
      },
      {
        id: '3',
        author: 'Thomas K.',
        location: 'Netherlands',
        rating: 5,
        date: '2024-09-28',
        content: 'Excellent apartment in a prime location. Easy access to public transport and many restaurants nearby. Would definitely stay again!',
      },
    ],
    rating: 4.9,
    reviewCount: 47,
    responseTime: 'Within 1 hour',
  },
  hindenburgdamm: {
    id: 'hinden',
    slug: 'hindenburgdamm',
    name: 'Hindenburgdamm Apartment',
    address: 'Hindenburgdamm 85, 12203 Berlin',
    coordinates: {
      lat: 52.4365,
      lng: 13.3197,
    },
    size: 45,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    basePrice: 95,
    cleaningFee: 40,
    petFee: 20,
    weeklyDiscount: 10,
    monthlyDiscount: 20,
    minStay: 3,
    checkInTime: '3:00 PM - 11:00 PM',
    checkOutTime: '11:00 AM',
    quietHoursStart: '10:00 PM',
    quietHoursEnd: '7:00 AM',
    petFriendly: true,
    smokingAllowed: false,
    partiesAllowed: false,
    images: [
      '/images/hindenburgdamm/bedroom1-main.jpg',
      '/images/hindenburgdamm/bedroom1-01.jpg',
      '/images/hindenburgdamm/bedroom1-02.jpg',
      '/images/hindenburgdamm/bedroom1-03.jpg',
      '/images/hindenburgdamm/bedroom1-04.jpg',
      '/images/hindenburgdamm/bedroom1-05.jpg',
      '/images/hindenburgdamm/bedroom1-06.jpg',
      '/images/hindenburgdamm/bedroom1-07.jpg',
      '/images/hindenburgdamm/bedroom1-08.jpg',
      '/images/hindenburgdamm/bedroom1-09.jpg',
      '/images/hindenburgdamm/bedroom1-10.jpg',
      '/images/hindenburgdamm/bedroom1-11.jpg',
      '/images/hindenburgdamm/bedroom1-12.jpg',
      '/images/hindenburgdamm/bedroom1-13.jpg',
      '/images/hindenburgdamm/bedroom2-01.jpg',
      '/images/hindenburgdamm/bedroom2-02.jpg',
      '/images/hindenburgdamm/bedroom2-03.jpg',
      '/images/hindenburgdamm/bedroom2-04.jpg',
      '/images/hindenburgdamm/bedroom2-05.jpg',
      '/images/hindenburgdamm/kitchen-01.jpg',
      '/images/hindenburgdamm/kitchen-02.jpg',
      '/images/hindenburgdamm/bathroom-01.jpg',
      '/images/hindenburgdamm/bathroom-02.jpg',
      '/images/hindenburgdamm/bathroom-03.jpg',
      '/images/hindenburgdamm/terrace-01.jpg',
      '/images/hindenburgdamm/terrace-02.jpg',
      '/images/hindenburgdamm/exterior-01.jpg',
      '/images/hindenburgdamm/exterior-02.jpg',
      '/images/hindenburgdamm/exterior-03.jpg',
      '/images/hindenburgdamm/exterior-04.jpg',
    ],
    description: {
      title: 'Comfortable Pet-Friendly Apartment Near Hospital',
      text: 'Our cozy 75m² apartment in Lichterfelde is ideal for hospital visitors and families. Pet-friendly and located close to major hospitals, this apartment provides a peaceful retreat with easy access to public transportation. Features a fully equipped kitchen and comfortable living spaces.',
    },
    amenities: [
      'wifi',
      'pet_friendly',
      'kitchen',
      'washer',
      'tv',
      'heating',
      'near_hospital',
      'smoke_detector',
      'first_aid',
      'public_transport',
    ],
    nearbyPlaces: [
      { name: 'Benjamin Franklin Hospital', distance: '500 m' },
      { name: 'Botanical Garden', distance: '2 km' },
      { name: 'Steglitz Shopping Center', distance: '1 km' },
      { name: 'Lichterfelde Süd Station', distance: '800 m' },
      { name: 'Schlosspark Theater', distance: '1.5 km' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Anna M.',
        location: 'Germany',
        rating: 5,
        date: '2024-10-12',
        content: 'Pet-friendly and near the hospital - exactly what we needed during a difficult time. The apartment was clean, comfortable, and the host was very understanding.',
      },
      {
        id: '2',
        author: 'David R.',
        location: 'France',
        rating: 5,
        date: '2024-10-05',
        content: 'Great location for hospital visits. Walking distance to Benjamin Franklin Hospital. The apartment was quiet and well-maintained.',
      },
      {
        id: '3',
        author: 'Lisa W.',
        location: 'Switzerland',
        rating: 5,
        date: '2024-09-22',
        content: 'Perfect for our family with a dog. The apartment was spacious and the area is very peaceful. Great communication with the property manager.',
      },
    ],
    rating: 4.9,
    reviewCount: 38,
    responseTime: 'Within 1 hour',
  },
  kottbusserdamm: {
    id: 'kotti',
    slug: 'kottbusserdamm',
    name: 'Kottbusser Damm Apartment',
    address: 'Kottbusser Damm 68, 10967 Berlin',
    coordinates: {
      lat: 52.4922,
      lng: 13.4197,
    },
    size: 55,
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 7,
    basePrice: 140,
    cleaningFee: 60,
    petFee: 25,
    weeklyDiscount: 10,
    monthlyDiscount: 20,
    minStay: 3,
    checkInTime: '3:00 PM - 11:00 PM',
    checkOutTime: '11:00 AM',
    quietHoursStart: '10:00 PM',
    quietHoursEnd: '7:00 AM',
    petFriendly: true,
    smokingAllowed: false,
    partiesAllowed: false,
    images: [
      '/images/kottbusserdamm/bedroom1-main.jpg',
      '/images/kottbusserdamm/bedroom1-01.jpg',
      '/images/kottbusserdamm/bedroom2-01.jpg',
      '/images/kottbusserdamm/bedroom3-01.jpg',
      '/images/kottbusserdamm/livingroom-01.jpg',
      '/images/kottbusserdamm/livingroom-02.jpg',
      '/images/kottbusserdamm/kitchen-01.jpg',
      '/images/kottbusserdamm/kitchen-02.jpg',
      '/images/kottbusserdamm/bathroom-01.jpg',
      '/images/kottbusserdamm/exterior-01.jpg',
      '/images/kottbusserdamm/garden-01.jpg',
    ],
    description: {
      title: 'Cozy Family & Friends Apartment in Kreuzberg',
      text: 'Wake up in the heart of Kreuzberg – the smell of fresh coffee from the street cafés, life buzzing between Kotti and Hermannplatz. Our modern 55m² apartment offers space for up to 7 guests with 3 Queen-size beds (140×200) and 1 single bed (90×200). Features a fully equipped kitchen with dishwasher, Tassimo coffee machine, Smart-TV with Netflix & Prime Video, private garden, and free garage parking. Perfect for families, groups of friends, or business travelers. 24/7 self-check-in with smart lock. Located just 100m from U-Bahn (U7/U8) with cafés, bars, restaurants, and the Landwehrkanal right around the corner.',
    },
    amenities: [
      'wifi',
      'pet_friendly',
      'kitchen',
      'washer',
      'dryer',
      'tv',
      'heating',
      'smoke_detector',
      'first_aid',
      'parking',
      'garden',
      'dishwasher',
      'ev_charger',
      'public_transport',
    ],
    nearbyPlaces: [
      { name: 'Kottbusser Tor', distance: '200 m' },
      { name: 'Hermannplatz', distance: '600 m' },
      { name: 'Landwehrkanal', distance: '300 m' },
      { name: 'Görlitzer Park', distance: '500 m' },
      { name: 'Markthalle Neun', distance: '800 m' },
    ],
    reviews: [
      {
        id: '1',
        author: 'Emma K.',
        location: 'Germany',
        rating: 5,
        date: '2024-11-15',
        content: 'Sehr sauber, super Lage und geschmackvoll eingerichtet. Perfekt für den Kiez! We loved staying here with our family.',
      },
      {
        id: '2',
        author: 'Marco B.',
        location: 'Italy',
        rating: 5,
        date: '2024-11-08',
        content: 'Amazing location in Kreuzberg! The apartment was spacious and had everything we needed. The private garden was a lovely surprise.',
      },
      {
        id: '3',
        author: 'Sophie L.',
        location: 'France',
        rating: 5,
        date: '2024-10-28',
        content: 'Perfect for our group of 6 friends. Great communication, easy check-in, and the location is unbeatable. Would definitely come back!',
      },
    ],
    rating: 4.9,
    reviewCount: 24,
    responseTime: 'Within 1 hour',
  },
};

export const getPropertyBySlug = (slug: string): Property | undefined => {
  return properties[slug];
};

export const getAllProperties = (): Property[] => {
  return Object.values(properties);
};
