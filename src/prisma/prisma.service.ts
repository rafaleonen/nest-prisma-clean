import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'warn', 'error'],
    })
  }

  onModuleDestroy() {
    return this.$disconnect()
  }

  onModuleInit() {
    return this.$connect()
  }
}
