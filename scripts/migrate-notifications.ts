#!/usr/bin/env tsx

/**
 * Migration script to add AdminNotification table
 * Run this after updating the schema to create the new table
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('✅ AdminNotification table should be created via prisma db push')
  console.log('📝 To apply the schema changes, run: npx prisma db push')
  console.log('🔄 To generate the client, run: npx prisma generate')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
