/**
 * Seed script for AI Presets
 * Seeds the default IMAGE and VIDEO presets from ai-presets.ts into the database
 * These are system presets (userId = null, isPublic = true)
 * 
 * Run with: npx ts-node prisma/seed-presets.ts
 * Or: npx tsx prisma/seed-presets.ts
 */

import { PrismaClient } from '@prisma/client'
import { IMAGE_PRESETS, VIDEO_PRESETS } from '../src/lib/ai-presets'

const prisma = new PrismaClient()

async function seedPresets() {
  console.log('🌱 Seeding AI Presets...')

  // Seed Image Presets
  console.log('\n📸 Seeding Image Presets...')
  for (const preset of IMAGE_PRESETS) {
    const existing = await prisma.aiPreset.findFirst({
      where: {
        name: preset.name,
        userId: null,
        type: 'IMAGE',
      },
    })

    if (existing) {
      console.log(`  ⏭️  Skipping "${preset.name}" (already exists)`)
      continue
    }

    await prisma.aiPreset.create({
      data: {
        userId: null, // System preset
        name: preset.name,
        description: preset.description,
        type: 'IMAGE',
        category: preset.category,
        promptTemplate: preset.promptTemplate,
        style: preset.style,
        aspectRatio: preset.aspectRatio,
        isPublic: true,
        usageCount: 0,
      },
    })
    console.log(`  ✅ Created "${preset.name}"`)
  }

  // Seed Video Presets
  console.log('\n🎬 Seeding Video Presets...')
  for (const preset of VIDEO_PRESETS) {
    const existing = await prisma.aiPreset.findFirst({
      where: {
        name: preset.name,
        userId: null,
        type: 'VIDEO',
      },
    })

    if (existing) {
      console.log(`  ⏭️  Skipping "${preset.name}" (already exists)`)
      continue
    }

    await prisma.aiPreset.create({
      data: {
        userId: null, // System preset
        name: preset.name,
        description: preset.description,
        type: 'VIDEO',
        category: preset.category,
        promptTemplate: preset.promptTemplate,
        duration: preset.duration,
        aspectRatio: preset.format,
        isPublic: true,
        usageCount: 0,
      },
    })
    console.log(`  ✅ Created "${preset.name}"`)
  }

  console.log('\n✨ Seeding complete!')

  // Summary
  const imageCount = await prisma.aiPreset.count({
    where: { type: 'IMAGE', userId: null },
  })
  const videoCount = await prisma.aiPreset.count({
    where: { type: 'VIDEO', userId: null },
  })

  console.log(`\n📊 Summary:`)
  console.log(`   - ${imageCount} System Image Presets`)
  console.log(`   - ${videoCount} System Video Presets`)
}

seedPresets()
  .catch((error) => {
    console.error('❌ Error seeding presets:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
