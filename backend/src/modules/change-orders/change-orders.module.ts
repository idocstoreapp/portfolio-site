import { Module } from '@nestjs/common';
import { ChangeOrdersController } from './change-orders.controller';
import { ChangeOrdersService } from './change-orders.service';
import { SupabaseModule } from '../../common/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ChangeOrdersController],
  providers: [ChangeOrdersService],
  exports: [ChangeOrdersService],
})
export class ChangeOrdersModule {}
