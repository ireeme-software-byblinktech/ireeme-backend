import { PrismaClient, RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed Script for Blink Academy
 * 
 * This script is idempotent - it can be run multiple times safely.
 * It will skip creating records that already exist.
 * 
 * To reset the database completely before seeding:
 * npx prisma migrate reset
 * 
 * Then run:
 * npm run db:seed
 */

async function main() {
  console.log('🌱 Starting seeding process...');

  const SALT_ROUNDS = 12;

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin@123', SALT_ROUNDS);
  const standardPassword = await bcrypt.hash('Password123!', SALT_ROUNDS);

  // 1. School Setup
  console.log('🏫 Setting up Blink Academy...');
  const school = await prisma.school.upsert({
    where: { code: 'BA001' },
    update: {},
    create: {
      name: 'Blink Academy',
      code: 'BA001',
      region: 'Kigali',
      type: 'Secondary',
      country: 'Rwanda',
      isActive: true,
    },
  });

  // 2. Admin User (admin@gmail.com / admin@123)
  console.log('👤 Creating Admin user (admin@gmail.com)...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      schoolId: school.id,
      isActive: true,
      roles: {
        create: {
          role: RoleType.SCHOOL_ADMIN,
          schoolId: school.id,
        },
      },
    },
  });

  // 3. Create Academic Term
  console.log('📅 Creating academic terms...');
  const term1 = await prisma.academicTerm.upsert({
    where: { id: 'term-2024-1' },
    update: {},
    create: {
      id: 'term-2024-1',
      schoolId: school.id,
      name: 'Term 1 - 2024',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-04-15'),
      isActive: false,
    },
  });

  const term2 = await prisma.academicTerm.upsert({
    where: { id: 'term-2025-1' },
    update: {},
    create: {
      id: 'term-2025-1',
      schoolId: school.id,
      name: 'Term 1 - 2025',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-04-15'),
      isActive: false,
    },
  });

  const term3 = await prisma.academicTerm.upsert({
    where: { id: 'term-2026-1' },
    update: {},
    create: {
      id: 'term-2026-1',
      schoolId: school.id,
      name: 'Term 1 - 2026',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-04-15'),
      isActive: true,
    },
  });

  const term4 = await prisma.academicTerm.upsert({
    where: { id: 'term-2026-2' },
    update: {},
    create: {
      id: 'term-2026-2',
      schoolId: school.id,
      name: 'Term 2 - 2026',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-08-15'),
      isActive: false,
    },
  });

  // 4. Create Classes
  console.log('🎓 Creating classes...');
  const classes = await Promise.all([
    prisma.class.upsert({
      where: { id: 'class-s1' },
      update: {},
      create: {
        id: 'class-s1',
        schoolId: school.id,
        termId: term3.id,
        name: 'Senior 1',
        year: 1,
        stream: 'A',
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-s2' },
      update: {},
      create: {
        id: 'class-s2',
        schoolId: school.id,
        termId: term3.id,
        name: 'Senior 2',
        year: 2,
        stream: 'B',
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-s3' },
      update: {},
      create: {
        id: 'class-s3',
        schoolId: school.id,
        termId: term3.id,
        name: 'Senior 3',
        year: 3,
        stream: 'A',
      },
    }),
  ]);

  // 5. Create Subjects
  console.log('📚 Creating subjects...');
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'Mathematics',
        code: 'MATH101',
        classId: classes[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'Physics',
        code: 'PHY101',
        classId: classes[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'Chemistry',
        code: 'CHEM101',
        classId: classes[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'Biology',
        code: 'BIO101',
        classId: classes[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        schoolId: school.id,
        name: 'English',
        code: 'ENG101',
        classId: classes[2].id,
      },
    }),
  ]);

  // 6. Create Teachers
  console.log('👨‍🏫 Creating teachers...');
  const teacherData = [
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@blinkacademy.com', empNum: 'TCH-001', dept: 'Science', qual: 'MSc Mathematics' },
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@blinkacademy.com', empNum: 'TCH-002', dept: 'Science', qual: 'BSc Physics' },
    { firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@blinkacademy.com', empNum: 'TCH-003', dept: 'Science', qual: 'MSc Chemistry' },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@blinkacademy.com', empNum: 'TCH-004', dept: 'Science', qual: 'BSc Biology' },
    { firstName: 'David', lastName: 'Wilson', email: 'david.wilson@blinkacademy.com', empNum: 'TCH-005', dept: 'Languages', qual: 'MA English Literature' },
    { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.anderson@blinkacademy.com', empNum: 'TCH-006', dept: 'Science', qual: 'BSc Mathematics' },
    { firstName: 'James', lastName: 'Taylor', email: 'james.taylor@blinkacademy.com', empNum: 'TCH-007', dept: 'Science', qual: 'MSc Physics' },
    { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@blinkacademy.com', empNum: 'TCH-008', dept: 'Languages', qual: 'BA English' },
  ];

  const teachers = [];
  for (const teacher of teacherData) {
    // Check if teacher profile exists by employee number (unique constraint)
    let teacherProfile = await prisma.teacher.findFirst({
      where: {
        schoolId: school.id,
        employeeNum: teacher.empNum,
      },
    });

    if (teacherProfile) {
      console.log(`   ⏭️  Teacher ${teacher.firstName} ${teacher.lastName} (${teacher.empNum}) already exists, skipping...`);
      teachers.push(teacherProfile);
      continue;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: teacher.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: teacher.email,
          passwordHash: standardPassword,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          schoolId: school.id,
          isActive: true,
          roles: {
            create: {
              role: RoleType.TEACHER,
              schoolId: school.id,
            },
          },
        },
      });
    }

    // Create teacher profile
    teacherProfile = await prisma.teacher.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        employeeNum: teacher.empNum,
        department: teacher.dept,
        qualification: teacher.qual,
        isActive: true,
      },
    });

    teachers.push(teacherProfile);
  }

  // Assign subjects to teachers (skip if already exists)
  const teacherSubjectAssignments = [
    { schoolId: school.id, teacherId: teachers[0].id, subjectId: subjects[0].id }, // John - Math
    { schoolId: school.id, teacherId: teachers[1].id, subjectId: subjects[1].id }, // Sarah - Physics
    { schoolId: school.id, teacherId: teachers[2].id, subjectId: subjects[2].id }, // Michael - Chemistry
    { schoolId: school.id, teacherId: teachers[3].id, subjectId: subjects[3].id }, // Emily - Biology
    { schoolId: school.id, teacherId: teachers[4].id, subjectId: subjects[4].id }, // David - English
  ];

  for (const assignment of teacherSubjectAssignments) {
    const existing = await prisma.teacherSubject.findUnique({
      where: {
        teacherId_subjectId: {
          teacherId: assignment.teacherId,
          subjectId: assignment.subjectId,
        },
      },
    });

    if (!existing) {
      await prisma.teacherSubject.create({
        data: assignment,
      });
    }
  }

  // 7. Create Students
  console.log('👨‍🎓 Creating students...');
  const studentData = [
    { firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@student.com', stuNum: 'STU-001', gender: 'Female', classId: classes[0].id, phone: '+250788123001' },
    { firstName: 'Bob', lastName: 'Martinez', email: 'bob.martinez@student.com', stuNum: 'STU-002', gender: 'Male', classId: classes[0].id, phone: '+250788123002' },
    { firstName: 'Carol', lastName: 'Rodriguez', email: 'carol.rodriguez@student.com', stuNum: 'STU-003', gender: 'Female', classId: classes[0].id, phone: '+250788123003' },
    { firstName: 'Daniel', lastName: 'Lee', email: 'daniel.lee@student.com', stuNum: 'STU-004', gender: 'Male', classId: classes[0].id, phone: '+250788123004' },
    { firstName: 'Emma', lastName: 'White', email: 'emma.white@student.com', stuNum: 'STU-005', gender: 'Female', classId: classes[1].id, phone: '+250788123005' },
    { firstName: 'Frank', lastName: 'Harris', email: 'frank.harris@student.com', stuNum: 'STU-006', gender: 'Male', classId: classes[1].id, phone: '+250788123006' },
    { firstName: 'Grace', lastName: 'Clark', email: 'grace.clark@student.com', stuNum: 'STU-007', gender: 'Female', classId: classes[1].id, phone: '+250788123007' },
    { firstName: 'Henry', lastName: 'Lewis', email: 'henry.lewis@student.com', stuNum: 'STU-008', gender: 'Male', classId: classes[1].id, phone: '+250788123008' },
    { firstName: 'Ivy', lastName: 'Walker', email: 'ivy.walker@student.com', stuNum: 'STU-009', gender: 'Female', classId: classes[2].id, phone: '+250788123009' },
    { firstName: 'Jack', lastName: 'Hall', email: 'jack.hall@student.com', stuNum: 'STU-010', gender: 'Male', classId: classes[2].id, phone: '+250788123010' },
    { firstName: 'Kate', lastName: 'Allen', email: 'kate.allen@student.com', stuNum: 'STU-011', gender: 'Female', classId: classes[2].id, phone: '+250788123011' },
    { firstName: 'Leo', lastName: 'Young', email: 'leo.young@student.com', stuNum: 'STU-012', gender: 'Male', classId: classes[2].id, phone: '+250788123012' },
    { firstName: 'Mia', lastName: 'King', email: 'mia.king@student.com', stuNum: 'STU-013', gender: 'Female', classId: classes[0].id, phone: '+250788123013' },
    { firstName: 'Noah', lastName: 'Scott', email: 'noah.scott@student.com', stuNum: 'STU-014', gender: 'Male', classId: classes[1].id, phone: '+250788123014' },
    { firstName: 'Olivia', lastName: 'Green', email: 'olivia.green@student.com', stuNum: 'STU-015', gender: 'Female', classId: classes[2].id, phone: '+250788123015' },
  ];

  const students = [];
  for (const student of studentData) {
    // Check if student profile exists by student number (unique constraint)
    let studentProfile = await prisma.student.findFirst({
      where: {
        schoolId: school.id,
        studentNumber: student.stuNum,
      },
    });

    if (studentProfile) {
      console.log(`   ⏭️  Student ${student.firstName} ${student.lastName} (${student.stuNum}) already exists, skipping...`);
      students.push(studentProfile);
      continue;
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: student.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: student.email,
          passwordHash: standardPassword,
          firstName: student.firstName,
          lastName: student.lastName,
          phoneNumber: student.phone,
          schoolId: school.id,
          isActive: true,
          roles: {
            create: {
              role: RoleType.STUDENT,
              schoolId: school.id,
            },
          },
        },
      });
    }

    // Create student profile
    studentProfile = await prisma.student.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        studentNumber: student.stuNum,
        gender: student.gender,
        classId: student.classId,
        dateOfBirth: new Date('2008-01-01'),
        isActive: true,
      },
    });

    // Enroll in class
    const existingEnrollment = await prisma.classStudent.findUnique({
      where: {
        classId_studentId: {
          classId: student.classId,
          studentId: studentProfile.id,
        },
      },
    });

    if (!existingEnrollment) {
      await prisma.classStudent.create({
        data: {
          schoolId: school.id,
          classId: student.classId,
          studentId: studentProfile.id,
        },
      });
    }

    students.push(studentProfile);
  }

  console.log('✅ Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   School: ${school.name} (${school.code})`);
  console.log(`   Admin: admin@gmail.com / admin@123`);
  console.log(`   Teachers: ${teachers.length} created`);
  console.log(`   Students: ${students.length} created`);
  console.log(`   Classes: ${classes.length} created`);
  console.log(`   Subjects: ${subjects.length} created`);

  // 8. Create Attendance Records for Today
  console.log('📊 Creating attendance records for today...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendanceRecords = [];
  for (const student of students) {
    // Create attendance for each subject
    for (const subject of subjects) {
      // Random attendance status (mostly present)
      const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const existing = await prisma.attendanceRecord.findUnique({
        where: {
          studentId_subjectId_date: {
            studentId: student.id,
            subjectId: subject.id,
            date: today,
          },
        },
      });

      if (!existing) {
        const record = await prisma.attendanceRecord.create({
          data: {
            schoolId: school.id,
            studentId: student.id,
            subjectId: subject.id,
            date: today,
            status: randomStatus as any,
            markedById: adminUser.id,
          },
        });
        attendanceRecords.push(record);
      }
    }
  }

  console.log(`   Attendance records: ${attendanceRecords.length} created for today`);

  // 9. Create Sample Election
  console.log('🗳️  Creating sample election...');

  // Delete old election with invalid ID if it exists
  await prisma.election.deleteMany({
    where: {
      id: 'election-2026',
    },
  });

  const election = await prisma.election.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440001' },
    update: { status: 'ACTIVE' }, // Make sure it's active
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      schoolId: school.id,
      title: 'Student Council 2026',
      startAt: new Date('2026-06-01'),
      endAt: new Date('2026-06-15'),
      status: 'ACTIVE',
    },
  });

  // Create positions
  const chairmanPosition = await prisma.electionPosition.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440002' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      schoolId: school.id,
      electionId: election.id,
      name: 'Chairman',
      maxVotes: 1,
    },
  });

  const vicechairPosition = await prisma.electionPosition.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440003' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      schoolId: school.id,
      electionId: election.id,
      name: 'Vice Chairman',
      maxVotes: 1,
    },
  });

  // Add candidates (first 4 students)
  if (students.length >= 4) {
    await prisma.candidate.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440004' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440004',
        schoolId: school.id,
        positionId: chairmanPosition.id,
        studentId: students[0].id,
        bio: 'I will work to improve student welfare and create more opportunities for everyone.',
      },
    });

    await prisma.candidate.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440005' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440005',
        schoolId: school.id,
        positionId: chairmanPosition.id,
        studentId: students[1].id,
        bio: 'My focus will be on academic excellence and extracurricular activities.',
      },
    });

    await prisma.candidate.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440006' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440006',
        schoolId: school.id,
        positionId: vicechairPosition.id,
        studentId: students[2].id,
        bio: 'I will ensure every student voice is heard and represented.',
      },
    });

    await prisma.candidate.upsert({
      where: { id: '550e8400-e29b-41d4-a716-446655440007' },
      update: {},
      create: {
        id: '550e8400-e29b-41d4-a716-446655440007',
        schoolId: school.id,
        positionId: vicechairPosition.id,
        studentId: students[3].id,
        bio: 'Together we can make our school a better place for learning and growth.',
      },
    });
  }

  console.log(`   Election: ${election.title} created with 2 positions and 4 candidates`);

  console.log('\n🔐 Login Credentials:');
  console.log('   Admin: admin@gmail.com / admin@123');
  console.log('   Teachers: [email] / Password123!');
  console.log('   Students: [email] / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
