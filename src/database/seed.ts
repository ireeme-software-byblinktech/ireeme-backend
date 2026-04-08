import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding process...');

  const SALT_ROUNDS = 12;
  const STANDARD_PASSWORD = 'Password123!';
  const hashedPassword = await bcrypt.hash(STANDARD_PASSWORD, SALT_ROUNDS);

  // 1. School Setup
  console.log('Setting up Blink Academy...');
  const school = await prisma.school.upsert({
    where: { code: 'BA001' },
    update: {},
    create: {
      name: 'Blink Academy',
      code: 'BA001',
      region: 'Accra',
      isActive: true,
    },
  });

  // 2. Super Admin Setup (Global scope)
  console.log('Creating Super Admin...');
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@blinkcampus.com' },
    update: {},
    create: {
      email: 'superadmin@blinkcampus.com',
      passwordHash: hashedPassword,
      firstName: 'Blink',
      lastName: 'SuperAdmin',
      isActive: true,
      roles: {
        create: {
          role: RoleType.SUPER_ADMIN,
          // Global role with no schoolId (null in DB).
        },
      },
    },
  })
  const createPortalUser = async (
    role: RoleType,
    prefix: string,
    profileFn?: (userId: string) => any
  ) => {
    const email = `${prefix.toLowerCase()}@blinkacademy.com`;
    console.log(`Creating ${role} user: ${email}...`);

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashedPassword,
        firstName: `${prefix}`,
        lastName: 'Portal',
        schoolId: school.id,
        isActive: true,
        roles: {
          create: {
            role,
            schoolId: school.id,
          },
        },
      },
    });

    if (profileFn) {
      await profileFn(user.id);
    }
    return user;
  };

  // 3. Portal Coverage
  
  // School Admin
  await createPortalUser(RoleType.SCHOOL_ADMIN, 'SchoolAdmin');

  // Student
  await createPortalUser(RoleType.STUDENT, 'Student', async (userId) => {
    await prisma.student.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        schoolId: school.id,
        studentNumber: 'ST-001',
        isActive: true,
      },
    });
  });

  // Teacher
  await createPortalUser(RoleType.TEACHER, 'Teacher', async (userId) => {
    await prisma.teacher.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        schoolId: school.id,
        employeeNum: 'TCH-001',
        isActive: true,
      },
    });
  });

  // Staff roles: Nurse, Accountant, Librarian
  const staffRoles = [
    { role: RoleType.NURSE, prefix: 'Nurse', empNum: 'EMP-001', designation: 'School Nurse' },
    { role: RoleType.ACCOUNTANT, prefix: 'Accountant', empNum: 'EMP-002', designation: 'Bursar' },
    { role: RoleType.LIBRARIAN, prefix: 'Librarian', empNum: 'EMP-003', designation: 'Librarian' },
  ];

  for (const staff of staffRoles) {
    await createPortalUser(staff.role, staff.prefix, async (userId) => {
      await prisma.staff.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          schoolId: school.id,
          employeeNum: staff.empNum,
          designation: staff.designation,
          isActive: true,
        },
      });
    });
  }

  // Discipline Officer
  await createPortalUser(RoleType.DISCIPLINE_OFFICER, 'Discipline');

  // Parent
  await createPortalUser(RoleType.PARENT, 'Parent', async (userId) => {
    await prisma.parent.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        schoolId: school.id,
        address: '123 Blink Street',
      },
    });
  });

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
