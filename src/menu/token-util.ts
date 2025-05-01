// menu/token-util.ts
import { get_encoding } from 'tiktoken';

export class TokenUtil {
  static countTokens(messages: { role: string; content: string }[]): number {
    const enc = get_encoding('cl100k_base');
    let totalTokens = 0;

    for (const msg of messages) {
      totalTokens += 4 + enc.encode(msg.content).length;
    }

    totalTokens += 2;
    enc.free();
    return totalTokens;
  }
}
