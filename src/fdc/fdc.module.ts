import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FdcService } from './fdс.service';

@Module({
  imports: [HttpModule],
  providers: [FdcService],
  exports: [FdcService],
})
export class FdcModule {}
