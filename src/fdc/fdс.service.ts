import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FdcService {
  private readonly logger = new Logger(FdcService.name);
  private readonly API_KEY = process.env.FDC_API_KEY;
  private readonly SEARCH_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

  constructor(private readonly httpService: HttpService) {}

  async searchByName(name: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(this.SEARCH_URL, {
          params: {
            api_key: this.API_KEY,
            query: name,
            pageSize: 5,
          },
        }),
      );

      return (data.foods || []).map((item) => ({
        name: item.description,
        calories:
          item.foodNutrients?.find((n) => n.nutrientName === 'Energy')?.value ||
          0,
        protein:
          item.foodNutrients?.find((n) => n.nutrientName === 'Protein')
            ?.value || 0,
        fat:
          item.foodNutrients?.find(
            (n) => n.nutrientName === 'Total lipid (fat)',
          )?.value || 0,
        carbs:
          item.foodNutrients?.find(
            (n) => n.nutrientName === 'Carbohydrate, by difference',
          )?.value || 0,
        source: 'fdc',
      }));
    } catch (err) {
      this.logger.error('FDC search error', err);
      return [];
    }
  }
}
