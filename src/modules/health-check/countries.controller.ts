import { Controller, Get, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { Public } from '../../common/decorators/public.decorator';

@Controller('countries')
export class CountriesController {
  private readonly logger = new Logger(CountriesController.name);

  constructor(private readonly httpService: HttpService) {}

  @Public()
  @Get()
  async getAllCountries() {
    try {
      // Try new API first
      const response = await firstValueFrom(
        this.httpService.get('https://api.restcountries.com/countries/v5?limit=300', {
          headers: {
            Authorization: 'Bearer rc_live_d7a20641e6874c23a0adc0aaef718064'
          }
        }).pipe(
          catchError(async (err) => {
            this.logger.warn('New countries API failed, falling back to old API', err.message);
            // Fallback to old API
            const fallbackResponse = await firstValueFrom(
              this.httpService.get('https://restcountries.com/v3.1/all?fields=name,cca2,flag')
            );
            return { data: { data: fallbackResponse.data } };
          })
        )
      );

      // Handle both new and old API response formats
      if (response.data?.data) {
        // New API format
        return response.data.data.map((country: any) => ({
          name: { common: country.names.common, official: country.names.official },
          cca2: country.codes.alpha_2,
          flag: country.flag.emoji
        }));
      } else {
        // Old API format (fallback)
        return response.data;
      }
    } catch (error) {
      this.logger.error('Failed to fetch countries', error.stack);
      throw error;
    }
  }
}
