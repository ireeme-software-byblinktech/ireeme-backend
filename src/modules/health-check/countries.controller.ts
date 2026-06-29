import { Controller, Get, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Public } from '../../common/decorators/public.decorator';

@Controller('countries')
export class CountriesController {
  private readonly logger = new Logger(CountriesController.name);

  // Hardcoded fallback countries in case all APIs fail
  private readonly fallbackCountries = [
    { name: { common: 'United States', official: 'United States of America' }, cca2: 'US', flag: '🇺🇸' },
    { name: { common: 'Canada', official: 'Canada' }, cca2: 'CA', flag: '🇨🇦' },
    { name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' }, cca2: 'GB', flag: '🇬🇧' },
    { name: { common: 'Australia', official: 'Commonwealth of Australia' }, cca2: 'AU', flag: '🇦🇺' },
    { name: { common: 'Germany', official: 'Federal Republic of Germany' }, cca2: 'DE', flag: '🇩🇪' },
    { name: { common: 'France', official: 'French Republic' }, cca2: 'FR', flag: '🇫🇷' },
    { name: { common: 'India', official: 'Republic of India' }, cca2: 'IN', flag: '🇮🇳' },
    { name: { common: 'Nigeria', official: 'Federal Republic of Nigeria' }, cca2: 'NG', flag: '🇳🇬' },
    { name: { common: 'Brazil', official: 'Federative Republic of Brazil' }, cca2: 'BR', flag: '🇧🇷' },
    { name: { common: 'Japan', official: 'Japan' }, cca2: 'JP', flag: '🇯🇵' }
  ];

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Get()
  async getAllCountries() {
    try {
      // Try new API first if token exists
      const apiKey = this.configService.get<string>('REST_COUNTRIES_API_KEY');
      
      if (apiKey) {
        try {
          const response = await firstValueFrom(
            this.httpService.get('https://api.restcountries.com/countries/v5?limit=300', {
              headers: {
                Authorization: `Bearer ${apiKey}`
              }
            })
          );

          if (response.data && Array.isArray(response.data.data)) {
            return response.data.data.map((country: any) => ({
              name: { common: country.names.common, official: country.names.official },
              cca2: country.codes.alpha_2,
              flag: country.flag.emoji
            }));
          }
        } catch (err) {
          this.logger.warn('New countries API failed, falling back to old API', err.message);
        }
      }

      // Fallback to old API
      try {
        const fallbackResponse = await firstValueFrom(
          this.httpService.get('https://restcountries.com/v3.1/all?fields=name,cca2,flag')
        );
        if (Array.isArray(fallbackResponse.data)) {
          return fallbackResponse.data;
        }
      } catch (err) {
        this.logger.warn('Old countries API failed, using hardcoded fallback', err.message);
      }
    } catch (error) {
      this.logger.error('Failed to fetch countries, using hardcoded fallback', error.stack);
    }

    return this.fallbackCountries;
  }
}
