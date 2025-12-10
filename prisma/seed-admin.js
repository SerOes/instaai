/**
 * Seed script to create admin user
 * Run with: node prisma/seed-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedAdmin() {
  console.log('🌱 Creating admin user...');

  const email = 'serhat.oesmen@gmail.com';
  
  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  });

  if (existing) {
    console.log('✅ Admin user already exists:', email);
    return;
  }

  // Create password hash using crypto (sha256)
  // Note: In production, use bcrypt. For now using crypto for simplicity.
  const password = 'Testen123';
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  // Create admin user - using correct field names from schema
  const user = await prisma.user.create({
    data: {
      name: 'Serhat Ösmen',
      email: email,
      passwordHash: passwordHash,  // Correct field name
      role: 'ADMIN',  // Uppercase as in schema
    }
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email:', user.email);
  console.log('   Role:', user.role);
}

seedAdmin()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
