import { Module } from '@nestjs/common';

import { databaseProviders } from './database.providers';

@Module({
  imports: [...databaseProviders],
  // providers: [],
  // exports: [],
})
export class DatabaseModule {}
