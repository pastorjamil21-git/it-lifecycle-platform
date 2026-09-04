const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const bcrypt = require('bcryptjs');

// Adapter takes a config object with a `url`, not a Database instance
const dbPath = path.resolve(__dirname, 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.licenseAssignment.deleteMany();
  await prisma.hardwareAsset.deleteMany();
  await prisma.license.deleteMany();
  await prisma.onboardingRequest.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('1amYourpopoy@21', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'pastor.jamil21@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const itTechPassword = await bcrypt.hash('ITTech123!', 10);
  await prisma.user.create({
    data: {
      name: 'IT Tech User',
      email: 'ittech@yourcompany.com',
      password: itTechPassword,
      role: 'IT_TECH',
    },
  });

  const hrPassword = await bcrypt.hash('HRManager123!', 10);
  await prisma.user.create({
    data: {
      name: 'HR Manager User',
      email: 'hrmanager@yourcompany.com',
      password: hrPassword,
      role: 'HR_MANAGER',
    },
  });

  const employeePassword = await bcrypt.hash('Employee123!', 10);
  await prisma.user.create({
    data: {
      name: 'Employee User',
      email: 'employee@yourcompany.com',
      password: employeePassword,
      role: 'EMPLOYEE',
    },
  });

  await prisma.hardwareAsset.createMany({
    data: [
      { serialNumber: 'LTP-PH-001', modelName: 'MacBook Pro 14" M3', status: 'AVAILABLE' },
      { serialNumber: 'LTP-PH-002', modelName: 'ThinkPad X1 Carbon Gen 11', status: 'AVAILABLE' },
      { serialNumber: 'LTP-PH-003', modelName: 'Dell XPS 15', status: 'AVAILABLE' },
    ],
  });

  await prisma.license.createMany({
    data: [
      { softwareName: 'Microsoft 365 E5', totalSeats: 50, availableSeats: 50 },
      { softwareName: 'GitHub Enterprise', totalSeats: 20, availableSeats: 20 },
      { softwareName: 'Figma Enterprise', totalSeats: 10, availableSeats: 10 },
    ],
  });

  await prisma.onboardingRequest.create({
    data: {
      name: 'Juan Dela Cruz',
      title: 'Full-Stack Developer',
      department: 'Engineering',
      startDate: new Date('2026-09-01'),
      manager: 'Maria Santos',
      status: 'Pending',
    },
  });

  console.log('Database seeded successfully with local IT inventory.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });