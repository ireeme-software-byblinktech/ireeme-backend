import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('countries')
export class CountriesController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async getAllCountries() {
    const response = await firstValueFrom(
      this.httpService.get('https://restcountries.com/v3.1/all?fields=name,cca2,flag')
    );
    return response.data;
  }
}
