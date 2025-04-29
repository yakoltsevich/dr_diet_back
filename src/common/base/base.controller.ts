import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export class BaseController {
  protected getUserId(req: Request): number {
    console.log('req.user',req.user)
    const id = req.user?.['id'];
    if (!id || typeof id !== 'number') {
      throw new UnauthorizedException('Unauthorized: User ID missing');
    }
    return id;
  }
}
