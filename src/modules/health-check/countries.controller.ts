import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Public } from '../../common/decorators/public.decorator';

@Controller('countries')
export class CountriesController {
  constructor(private readonly httpService: HttpService) {}

  @Public()
  @Get()
  async getAllCountries() {
    const response = await firstValueFrom(
      this.httpService.get('https://api.restcountries.com/countries/v5?limit=300', {
        headers: {
          Authorization: 'Bearer rc_live_d7a20641e6874c23a0adc0aaef718064'
        }
      })
    );
    // Transform to match frontend's expected format
    return response.data.data.map((country: any) => ({
      name: { common: country.names.common, official: country.names.official },
      cca2: country.codes.alpha_2,
      flag: country.flag.emoji
    }));
  }
}
