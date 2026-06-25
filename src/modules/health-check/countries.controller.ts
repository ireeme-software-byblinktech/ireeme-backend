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
      this.httpService.get('https://restcountries.com/v3.1/all?fields=name,cca2,flag')
    );
    return response.data;
  }
}
