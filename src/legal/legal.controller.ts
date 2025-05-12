import { Controller, Get } from '@nestjs/common';
import { LegalService } from './legal.service';

@Controller('legal')
export class LegalController {
  constructor(private readonly legalService: LegalService) {}

  @Get('privacy')
  getPrivacyPolicy() {
    return this.legalService.getPrivacyPolicy();
  }

  @Get('terms')
  getTermsOfUse() {
    return this.legalService.getTermsOfUse();
  }
}
