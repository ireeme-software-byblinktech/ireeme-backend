import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';

@Controller('countries')
export class CountriesController {
  private readonly logger = new Logger(CountriesController.name);

  // Hardcoded list that always works
  private readonly countries = [
    { name: { common: 'United States', official: 'United States of America' }, cca2: 'US', flag: '🇺🇸' },
    { name: { common: 'Canada', official: 'Canada' }, cca2: 'CA', flag: '🇨🇦' },
    { name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' }, cca2: 'GB', flag: '🇬🇧' },
    { name: { common: 'Australia', official: 'Commonwealth of Australia' }, cca2: 'AU', flag: '🇦🇺' },
    { name: { common: 'Germany', official: 'Federal Republic of Germany' }, cca2: 'DE', flag: '🇩🇪' },
    { name: { common: 'France', official: 'French Republic' }, cca2: 'FR', flag: '🇫🇷' },
    { name: { common: 'India', official: 'Republic of India' }, cca2: 'IN', flag: '🇮🇳' },
    { name: { common: 'Nigeria', official: 'Federal Republic of Nigeria' }, cca2: 'NG', flag: '🇳🇬' },
    { name: { common: 'Brazil', official: 'Federative Republic of Brazil' }, cca2: 'BR', flag: '🇧🇷' },
    { name: { common: 'Japan', official: 'Japan' }, cca2: 'JP', flag: '🇯🇵' },
    { name: { common: 'Mexico', official: 'United Mexican States' }, cca2: 'MX', flag: '🇲🇽' },
    { name: { common: 'South Africa', official: 'Republic of South Africa' }, cca2: 'ZA', flag: '🇿🇦' },
    { name: { common: 'Kenya', official: 'Republic of Kenya' }, cca2: 'KE', flag: '🇰🇪' },
    { name: { common: 'Egypt', official: 'Arab Republic of Egypt' }, cca2: 'EG', flag: '🇪🇬' },
    { name: { common: 'China', official: "People's Republic of China" }, cca2: 'CN', flag: '🇨🇳' },
    { name: { common: 'South Korea', official: 'Republic of Korea' }, cca2: 'KR', flag: '🇰🇷' },
    { name: { common: 'Indonesia', official: 'Republic of Indonesia' }, cca2: 'ID', flag: '🇮🇩' },
    { name: { common: 'Pakistan', official: 'Islamic Republic of Pakistan' }, cca2: 'PK', flag: '🇵🇰' },
    { name: { common: 'Bangladesh', official: 'People\'s Republic of Bangladesh' }, cca2: 'BD', flag: '🇧🇩' },
    { name: { common: 'Rwanda', official: 'Republic of Rwanda' }, cca2: 'RW', flag: '🇷🇼' }
  ];

  @Public()
  @Get()
  getAllCountries() {
    this.logger.log('Returning countries list');
    return this.countries;
  }
}