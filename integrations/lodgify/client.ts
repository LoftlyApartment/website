import axios, { AxiosInstance } from 'axios';
import type { LodgifyProperty, LodgifyAvailability } from '@/types';

class LodgifyClient {
  private client: AxiosInstance;

  constructor() {
    const apiKey = process.env.LODGIFY_API_KEY;
    const baseURL = process.env.LODGIFY_API_URL || 'https://api.lodgify.com/v1';

    if (!apiKey) {
      throw new Error('LODGIFY_API_KEY is not configured');
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'X-ApiKey': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async getProperties(): Promise<LodgifyProperty[]> {
    try {
      const response = await this.client.get('/properties');
      return response.data;
    } catch (error) {
      console.error('Error fetching properties from Lodgify:', error);
      throw error;
    }
  }

  async getProperty(propertyId: number): Promise<LodgifyProperty> {
    try {
      const response = await this.client.get(`/properties/${propertyId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property ${propertyId} from Lodgify:`, error);
      throw error;
    }
  }

  async getAvailability(
    propertyId: number,
    startDate: string,
    endDate: string
  ): Promise<LodgifyAvailability[]> {
    try {
      const response = await this.client.get(`/properties/${propertyId}/calendar`, {
        params: {
          start: startDate,
          end: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching availability for property ${propertyId}:`, error);
      throw error;
    }
  }

  async createBooking(data: {
    property_id: number;
    arrival: string;
    departure: string;
    guests: number;
    guest_name: string;
    guest_email: string;
  }) {
    try {
      const response = await this.client.post('/bookings', data);
      return response.data;
    } catch (error) {
      console.error('Error creating booking in Lodgify:', error);
      throw error;
    }
  }

  async syncProperty(propertyId: number): Promise<void> {
    await this.getProperty(propertyId);
  }
}

export const lodgifyClient = new LodgifyClient();
