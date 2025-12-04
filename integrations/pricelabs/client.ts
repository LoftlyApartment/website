import axios, { AxiosInstance } from 'axios';

interface PriceLabsPrice {
  date: string;
  price: number;
  min_stay: number;
}

interface PriceLabsRecommendation {
  property_id: string;
  prices: PriceLabsPrice[];
}

class PriceLabsClient {
  private client: AxiosInstance;

  constructor() {
    const apiKey = process.env.PRICELABS_API_KEY;
    const baseURL = process.env.PRICELABS_API_URL || 'https://api.pricelabs.co/v1';

    if (!apiKey) {
      throw new Error('PRICELABS_API_KEY is not configured');
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getPriceRecommendations(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<PriceLabsRecommendation> {
    try {
      const response = await this.client.get(`/properties/${propertyId}/prices`, {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching price recommendations from PriceLabs:', error);
      throw error;
    }
  }

  async updatePrices(
    propertyId: string,
    prices: Array<{ date: string; price: number }>
  ): Promise<void> {
    try {
      await this.client.post(`/properties/${propertyId}/prices`, {
        prices,
      });
    } catch (error) {
      console.error('Error updating prices in PriceLabs:', error);
      throw error;
    }
  }

  async syncPrices(propertyId: string): Promise<void> {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    await this.getPriceRecommendations(propertyId, startDate, endDate);
  }
}

export const priceLabsClient = new PriceLabsClient();
