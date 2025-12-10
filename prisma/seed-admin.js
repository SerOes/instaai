/**
 * Seed script to create admin user
 * Run with: node prisma/seed-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
    // Update password hash in case it was wrong
    const passwordHash = await bcrypt.hash('Testen123', 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: passwordHash, role: 'ADMIN', isActive: true }
    });
    console.log('🔄 Updated admin user password hash');
    return;
  }

  // Create password hash using bcrypt (same as auth.ts uses)
  const password = 'Testen123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Create admin user - using correct field names from schema
  const user = await prisma.user.create({
    data: {
      name: 'Serhat Ösmen',
      email: email,
      passwordHash: passwordHash,
      role: 'ADMIN',
      isActive: true,
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
