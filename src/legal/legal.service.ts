import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LegalService {
  private readJson(filename: string): any {
    const filePath = path.join(
      process.cwd(),
      'src',
      'assets',
      'legal',
      filename,
    );
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  }

  getPrivacyPolicy() {
    return this.readJson('privacy.json');
  }

  getTermsOfUse() {
    try {
      return this.readJson('terms.json');
    } catch (err) {
      return { message: err.message };
    }
  }
}
