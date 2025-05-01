// menu/openai.client.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OpenAiClient {
  private openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('OpenAI API Key не найден');
    }

    this.openai = new OpenAI({ apiKey });
  }

  async chat(
    messages: { role: 'system' | 'user'; content: string }[],
    maxTokens = 4000,
    responseFormat: 'json_object' | 'text' = 'json_object',
  ) {
    return await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
      response_format: { type: responseFormat }, // ✅ исправлено здесь
    });
  }
}
