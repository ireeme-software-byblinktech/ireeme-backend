import { PrismaClient, RoleType, AssignmentType, SubmissionStatus, AttendanceStatus, AppealStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Hope Haven School seeding process...');

  const SALT_ROUNDS = 12;
  const STANDARD_PASSWORD = 'Password123!';
  const hashedPassword = await bcrypt.hash(STANDARD_PASSWORD, SALT_ROUNDS);

  // 1. Get Hope Haven School from database
  console.log('📚 Fetching Hope Haven School...');
  let school = await prisma.school.findFirst({
    where: { name: 'Hope haven school' },
  });

  if (!school) {
    console.log('📚 Creating Hope Haven School...');
    school = await prisma.school.create({
      data: {
        name: 'Hope haven school',
        code: 'HHS-001',
        region: 'Kigali',
        country: 'Rwanda',
        type: 'SECONDARY',
        isActive: true,
      },
    });
  }
  console.log(`✅ School: ${school.name} (${school.id})`);

  // 2. Create Academic Term
  console.log('📅 Creating Academic Term...');
  const term = await prisma.academicTerm.upsert({
    where: { id: 'term-2024-2025' },
    update: {},
    create: {
      id: 'term-2024-2025',
      schoolId: school.id,
      name: '2024-2025 Academic Year',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
    },
  });
  console.log(`✅ Term: ${term.name}`);

  // 3. Create Classes
  console.log('🏫 Creating Classes...');
  const classes = await Promise.all([
    prisma.class.upsert({
      where: { id: 'class-grade10a' },
      update: {},
      create: {
        id: 'class-grade10a',
        schoolId: school.id,
        name: 'Grade 10-A',
        year: 10,
        stream: 'A',
        termId: term.id,
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-grade10b' },
      update: {},
      create: {
        id: 'class-grade10b',
        schoolId: school.id,
        name: 'Grade 10-B',
        year: 10,
        stream: 'B',
        termId: term.id,
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-grade11a' },
      update: {},
      create: {
        id: 'class-grade11a',
        schoolId: school.id,
        name: 'Grade 11-A',
        year: 11,
        stream: 'A',
        termId: term.id,
      },
    }),
  ]);
  console.log(`✅ Created ${classes.length} classes`);

  // 4. Create Subjects
  console.log('📖 Creating Subjects...');
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { id: 'subj-math' },
      update: {},
      create: {
        id: 'subj-math',
        schoolId: school.id,
        name: 'Mathematics',
        code: 'MATH101',
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subj-english' },
      update: {},
      create: {
        id: 'subj-english',
        schoolId: school.id,
        name: 'English Language',
        code: 'ENG101',
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subj-physics' },
      update: {},
      create: {
        id: 'subj-physics',
        schoolId: school.id,
        name: 'Physics',
        code: 'PHY101',
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subj-chemistry' },
      update: {},
      create: {
        id: 'subj-chemistry',
        schoolId: school.id,
        name: 'Chemistry',
        code: 'CHM101',
      },
    }),
    prisma.subject.upsert({
      where: { id: 'subj-biology' },
      update: {},
      create: {
        id: 'subj-biology',
        schoolId: school.id,
        name: 'Biology',
        code: 'BIO101',
      },
    }),
  ]);
  console.log(`✅ Created ${subjects.length} subjects`);

  // 5. Create Teacher
  console.log('👨‍🏫 Creating Teachers...');
  const teacherUser = await prisma.user.upsert({
    where: { email: 'ms.johnson@hopehaven.com' },
    update: {},
    create: {
      email: 'ms.johnson@hopehaven.com',
      passwordHash: hashedPassword,
      firstName: 'Ms.',
      lastName: 'Johnson',
      phoneNumber: '+250788123456',
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

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      schoolId: school.id,
      employeeNum: 'TCH-HHS-001',
      department: 'Science',
      qualification: 'BSc Mathematics, MEd',
      joiningDate: new Date('2022-09-01'),
      isActive: true,
    },
  });
  console.log(`✅ Primary Teacher: ${teacherUser.firstName} ${teacherUser.lastName}`);

  // Create additional teachers
  const additionalTeachers = await Promise.all([
    (async () => {
      const user = await prisma.user.upsert({
        where: { email: 'mr.smith@hopehaven.com' },
        update: {},
        create: {
          email: 'mr.smith@hopehaven.com',
          passwordHash: hashedPassword,
          firstName: 'Mr.',
          lastName: 'Smith',
          phoneNumber: '+250788123457',
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
      const t = await prisma.teacher.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          schoolId: school.id,
          employeeNum: 'TCH-HHS-002',
          department: 'Languages',
          qualification: 'BA English, MEd',
          joiningDate: new Date('2021-09-01'),
          isActive: true,
        },
      });
      return { user, teacher: t };
    })(),
    (async () => {
      const user = await prisma.user.upsert({
        where: { email: 'dr.garcia@hopehaven.com' },
        update: {},
        create: {
          email: 'dr.garcia@hopehaven.com',
          passwordHash: hashedPassword,
          firstName: 'Dr.',
          lastName: 'Garcia',
          phoneNumber: '+250788123458',
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
      const t = await prisma.teacher.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          schoolId: school.id,
          employeeNum: 'TCH-HHS-003',
          department: 'Science',
          qualification: 'PhD Physics',
          joiningDate: new Date('2020-09-01'),
          isActive: true,
        },
      });
      return { user, teacher: t };
    })(),
    (async () => {
      const user = await prisma.user.upsert({
        where: { email: 'mrs.taylor@hopehaven.com' },
        update: {},
        create: {
          email: 'mrs.taylor@hopehaven.com',
          passwordHash: hashedPassword,
          firstName: 'Mrs.',
          lastName: 'Taylor',
          phoneNumber: '+250788123459',
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
      const t = await prisma.teacher.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          schoolId: school.id,
          employeeNum: 'TCH-HHS-004',
          department: 'Arts',
          qualification: 'BA History, MEd',
          joiningDate: new Date('2023-09-01'),
          isActive: true,
        },
      });
      return { user, teacher: t };
    })(),
  ]);
  console.log(`✅ Created ${additionalTeachers.length} additional teachers`);

  // Create school admins
  const schoolAdminUser = await prisma.user.upsert({
    where: { email: 'admin.principal@hopehaven.com' },
    update: {},
    create: {
      email: 'admin.principal@hopehaven.com',
      passwordHash: hashedPassword,
      firstName: 'Principal',
      lastName: 'Alexander',
      phoneNumber: '+250788123460',
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
  console.log(`✅ School Admin: ${schoolAdminUser.firstName} ${schoolAdminUser.lastName}`);

  const adminUser2 = await prisma.user.upsert({
    where: { email: 'admin.registrar@hopehaven.com' },
    update: {},
    create: {
      email: 'admin.registrar@hopehaven.com',
      passwordHash: hashedPassword,
      firstName: 'Registrar',
      lastName: 'Brown',
      phoneNumber: '+250788123461',
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
  console.log(`✅ School Admin: ${adminUser2.firstName} ${adminUser2.lastName}`);

  // 6. Assign Teacher to Subjects
  console.log('📚 Assigning Teacher to Subjects...');
  await Promise.all([
    prisma.teacherSubject.upsert({
      where: { id: 'ts-math' },
      update: {},
      create: {
        id: 'ts-math',
        schoolId: school.id,
        teacherId: teacher.id,
        subjectId: subjects[0].id, // Mathematics
      },
    }),
    prisma.teacherSubject.upsert({
      where: { id: 'ts-physics' },
      update: {},
      create: {
        id: 'ts-physics',
        schoolId: school.id,
        teacherId: teacher.id,
        subjectId: subjects[2].id, // Physics
      },
    }),
  ]);
  console.log(`✅ Teacher assigned to 2 subjects`);

  // 7. Create Students
  console.log('👨‍🎓 Creating Students...');
  const studentData = [
    { name: 'Alice Johnson', studentId: 'STU2024001', classId: 'class-grade10a' },
    { name: 'Bob Smith', studentId: 'STU2024002', classId: 'class-grade10a' },
    { name: 'Charlie Brown', studentId: 'STU2024003', classId: 'class-grade10b' },
    { name: 'Diana Prince', studentId: 'STU2024004', classId: 'class-grade10b' },
    { name: 'Emma Wilson', studentId: 'STU2024005', classId: 'class-grade11a' },
    { name: 'Frank Miller', studentId: 'STU2024006', classId: 'class-grade11a' },
    { name: 'Grace Lee', studentId: 'STU2024007', classId: 'class-grade10a' },
    { name: 'Henry Davis', studentId: 'STU2024008', classId: 'class-grade10b' },
  ];

  const students = await Promise.all(
    studentData.map(async (data, idx) => {
      const user = await prisma.user.upsert({
        where: { email: `${data.name.toLowerCase().replace(' ', '.')}@hopehaven.com` },
        update: {},
        create: {
          email: `${data.name.toLowerCase().replace(' ', '.')}@hopehaven.com`,
          passwordHash: hashedPassword,
          firstName: data.name.split(' ')[0],
          lastName: data.name.split(' ')[1],
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

      const student = await prisma.student.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          schoolId: school.id,
          studentNumber: data.studentId,
          dateOfBirth: new Date(`2008-${String((idx % 12) + 1).padStart(2, '0')}-${String((idx % 28) + 1).padStart(2, '0')}`),
          gender: idx % 2 === 0 ? 'Female' : 'Male',
          enrollmentDate: new Date('2024-09-01'),
          isActive: true,
        },
      });

      // Enroll student in class
      await prisma.classStudent.upsert({
        where: { id: `cs-${student.id}-${data.classId}` },
        update: {},
        create: {
          id: `cs-${student.id}-${data.classId}`,
          schoolId: school.id,
          classId: data.classId,
          studentId: student.id,
          enrolledAt: new Date('2024-09-01'),
        },
      });

      return student;
    })
  );
  console.log(`✅ Created ${students.length} students`);

  // 8. Create Assignments
  console.log('📝 Creating Assignments...');
  const assignments = await Promise.all([
    prisma.assignment.create({
      data: {
        schoolId: school.id,
        subjectId: subjects[0].id, // Mathematics
        classId: classes[0].id, // Grade 10-A
        teacherId: teacher.id,
        title: 'Homework #4 - Algebraic Equations',
        description: 'Solve the following algebraic equations and show your work.',
        type: AssignmentType.HOMEWORK,
        maxScore: 20,
        weight: 0.1,
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        allowLate: true,
        fileUrls: [],
      },
    }),
    prisma.assignment.create({
      data: {
        schoolId: school.id,
        subjectId: subjects[0].id, // Mathematics
        classId: classes[0].id, // Grade 10-A
        teacherId: teacher.id,
        title: 'Quiz 5 - Geometry Basics',
        description: 'Test your knowledge on basic geometry concepts.',
        type: AssignmentType.QUIZ,
        maxScore: 30,
        weight: 0.15,
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        allowLate: false,
        fileUrls: [],
      },
    }),
    prisma.assignment.create({
      data: {
        schoolId: school.id,
        subjectId: subjects[2].id, // Physics
        classId: classes[0].id, // Grade 10-A
        teacherId: teacher.id,
        title: 'Midterm Project - Physics in Real Life',
        description: 'Create a project demonstrating physics concepts in everyday life.',
        type: AssignmentType.PROJECT,
        maxScore: 50,
        weight: 0.25,
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        allowLate: true,
        fileUrls: [],
      },
    }),
  ]);
  console.log(`✅ Created ${assignments.length} assignments`);

  // 9. Create Submissions
  console.log('📤 Creating Submissions...');
  const submissions = await Promise.all(
    students.slice(0, 6).map(async (student, idx) => {
      const assignment = assignments[idx % assignments.length];
      return prisma.submission.create({
        data: {
          schoolId: school.id,
          assignmentId: assignment.id,
          studentId: student.id,
          content: 'Student submission content here...',
          fileUrls: [],
          submittedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          isLate: Math.random() > 0.7,
          status: SubmissionStatus.SUBMITTED,
        },
      });
    })
  );
  console.log(`✅ Created ${submissions.length} submissions`);

  // 10. Create Grades
  console.log('⭐ Creating Grades...');
  const grades = await Promise.all(
    submissions.map(async (submission, idx) => {
      const assignment = assignments[idx % assignments.length];
      return prisma.grade.create({
        data: {
          schoolId: school.id,
          submissionId: submission.id,
          studentId: submission.studentId,
          subjectId: assignment.subjectId,
          teacherId: teacher.id,
          termId: term.id,
          score: 15 + Math.random() * 15,
          maxScore: assignment.maxScore,
          feedback: idx % 3 === 0 ? 'Great work! Keep it up.' : 'Good effort, but review the concepts.',
          gradedAt: new Date(),
          appealStatus: idx % 5 === 0 ? AppealStatus.PENDING : null,
        },
      });
    })
  );
  console.log(`✅ Created ${grades.length} grades`);

  // 11. Create Attendance Records
  console.log('✅ Creating Attendance Records...');
  const today = new Date();
  const attendanceRecords = await Promise.all(
    students.slice(0, 5).map(async (student, idx) => {
      const statuses = [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.EXCUSED];
      const recordDate = new Date(today.getTime() - idx * 24 * 60 * 60 * 1000);
      return prisma.attendanceRecord.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: student.id,
            subjectId: subjects[0].id,
            date: recordDate,
          },
        },
        update: {},
        create: {
          schoolId: school.id,
          studentId: student.id,
          subjectId: subjects[0].id, // Mathematics
          date: recordDate,
          status: statuses[idx % statuses.length],
          markedById: teacherUser.id,
          note: idx % 2 === 0 ? 'On time' : 'Late arrival',
        },
      });
    })
  );
  console.log(`✅ Created ${attendanceRecords.length} attendance records`);

  // 12. Create Timetable Slots - Comprehensive weekly schedule
  console.log('⏰ Creating Timetable Slots...');
  const timetableSlots = await Promise.all([
    // Primary Teacher - Grade 10-A (Monday-Wednesday)
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 1,
          startTime: '08:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[0].id, // Grade 10-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        room: '101',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 1,
          startTime: '11:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[0].id, // Grade 10-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 1, // Monday
        startTime: '11:00',
        room: '101',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 2,
          startTime: '09:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[0].id, // Grade 10-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        room: '101',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 3,
          startTime: '13:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[0].id, // Grade 10-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 3, // Wednesday
        startTime: '13:00',
        room: '101',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 4,
          startTime: '08:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[0].id, // Grade 10-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 4, // Thursday
        startTime: '08:00',
        room: '101',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 5,
          startTime: '14:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[0].id, // Grade 10-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 5, // Friday
        startTime: '14:00',
        room: '101',
      },
    }),
    // Primary Teacher - Grade 10-B (Physics)
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 1,
          startTime: '09:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[1].id, // Grade 10-B
        subjectId: subjects[2].id, // Physics
        teacherId: teacher.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        room: 'Lab1',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 2,
          startTime: '11:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[1].id, // Grade 10-B
        subjectId: subjects[2].id, // Physics
        teacherId: teacher.id,
        dayOfWeek: 2, // Tuesday
        startTime: '11:00',
        room: 'Lab1',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 4,
          startTime: '14:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[1].id, // Grade 10-B
        subjectId: subjects[2].id, // Physics
        teacherId: teacher.id,
        dayOfWeek: 4, // Thursday
        startTime: '14:00',
        room: 'Lab1',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 5,
          startTime: '09:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[1].id, // Grade 10-B
        subjectId: subjects[2].id, // Physics
        teacherId: teacher.id,
        dayOfWeek: 5, // Friday
        startTime: '09:00',
        room: 'Lab1',
      },
    }),
    // Primary Teacher - Grade 11-A (English)
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 2,
          startTime: '13:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[2].id, // Grade 11-A
        subjectId: subjects[3].id, // English
        teacherId: teacher.id,
        dayOfWeek: 2, // Tuesday
        startTime: '13:00',
        room: '105',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 3,
          startTime: '08:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[2].id, // Grade 11-A
        subjectId: subjects[3].id, // English
        teacherId: teacher.id,
        dayOfWeek: 3, // Wednesday
        startTime: '08:00',
        room: '105',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 4,
          startTime: '11:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[2].id, // Grade 11-A
        subjectId: subjects[3].id, // English
        teacherId: teacher.id,
        dayOfWeek: 4, // Thursday
        startTime: '11:00',
        room: '105',
      },
    }),
    prisma.timetableSlot.upsert({
      where: {
        teacherId_dayOfWeek_startTime: {
          teacherId: teacher.id,
          dayOfWeek: 5,
          startTime: '13:00',
        },
      },
      update: {},
      create: {
        schoolId: school.id,
        classId: classes[2].id, // Grade 11-A
        subjectId: subjects[3].id, // English
        teacherId: teacher.id,
        dayOfWeek: 5, // Friday
        startTime: '13:00',
        room: '105',
      },
    }),
  ]);
  console.log(`✅ Created ${timetableSlots.length} timetable slots`);


  // 13. Create Grade Appeals
  console.log('🔔 Creating Grade Appeals...');
  const gradeAppeals = await Promise.all(
    grades.slice(0, 2).map(async (grade) => {
      return prisma.gradeAppeal.create({
        data: {
          gradeId: grade.id,
          studentId: grade.studentId,
          schoolId: school.id,
          reason: 'I believe my grade should be reviewed.',
          status: AppealStatus.PENDING,
        },
      });
    })
  );
  console.log(`✅ Created ${gradeAppeals.length} grade appeals`);

  // 14. Create Conversation (Teacher-Parent Communication)
  console.log('💬 Creating Parent Users and Conversations...');
  
  // Create multiple parents
  const parentUsers = await Promise.all([
    (async () => {
      const user = await prisma.user.upsert({
        where: { email: 'parent.john@hopehaven.com' },
        update: {},
        create: {
          email: 'parent.john@hopehaven.com',
          passwordHash: hashedPassword,
          firstName: 'John',
          lastName: 'Parent',
          schoolId: school.id,
          isActive: true,
          roles: {
            create: {
              role: RoleType.PARENT,
              schoolId: school.id,
            },
          },
        },
      });
      const p = await prisma.parent.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          schoolId: school.id,
          phone: '+250788654321',
          address: '123 Hope Street, Kigali',
        },
      });
      return { user, parent: p };
    })(),
    (async () => {
      const user = await prisma.user.upsert({
        where: { email: 'parent.sarah@hopehaven.com' },
        update: {},
        create: {
          email: 'parent.sarah@hopehaven.com',
          passwordHash: hashedPassword,
          firstName: 'Sarah',
          lastName: 'Wilson',
          schoolId: school.id,
          isActive: true,
          roles: {
            create: {
              role: RoleType.PARENT,
              schoolId: school.id,
            },
          },
        },
      });
      const p = await prisma.parent.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          schoolId: school.id,
          phone: '+250788654322',
          address: '456 Education Avenue, Kigali',
        },
      });
      return { user, parent: p };
    })(),
    (async () => {
      const user = await prisma.user.upsert({
        where: { email: 'parent.michael@hopehaven.com' },
        update: {},
        create: {
          email: 'parent.michael@hopehaven.com',
          passwordHash: hashedPassword,
          firstName: 'Michael',
          lastName: 'Chen',
          schoolId: school.id,
          isActive: true,
          roles: {
            create: {
              role: RoleType.PARENT,
              schoolId: school.id,
            },
          },
        },
      });
      const p = await prisma.parent.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          schoolId: school.id,
          phone: '+250788654323',
          address: '789 Learning Lane, Kigali',
        },
      });
      return { user, parent: p };
    })(),
  ]);

  // Link parents to students
  await Promise.all([
    prisma.parentStudent.upsert({
      where: { id: `ps-${parentUsers[0].parent.id}-${students[0].id}` },
      update: {},
      create: {
        id: `ps-${parentUsers[0].parent.id}-${students[0].id}`,
        schoolId: school.id,
        parentId: parentUsers[0].parent.id,
        studentId: students[0].id,
        verified: true,
      },
    }),
    prisma.parentStudent.upsert({
      where: { id: `ps-${parentUsers[1].parent.id}-${students[1].id}` },
      update: {},
      create: {
        id: `ps-${parentUsers[1].parent.id}-${students[1].id}`,
        schoolId: school.id,
        parentId: parentUsers[1].parent.id,
        studentId: students[1].id,
        verified: true,
      },
    }),
    prisma.parentStudent.upsert({
      where: { id: `ps-${parentUsers[2].parent.id}-${students[2].id}` },
      update: {},
      create: {
        id: `ps-${parentUsers[2].parent.id}-${students[2].id}`,
        schoolId: school.id,
        parentId: parentUsers[2].parent.id,
        studentId: students[2].id,
        verified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${parentUsers.length} parent users`);

  // Create conversations between teacher and different users
  const conversation = await prisma.conversation.create({
    data: {
      schoolId: school.id,
      members: {
        create: [
          { schoolId: school.id, userId: teacherUser.id },
          { schoolId: school.id, userId: parentUsers[0].user.id },
        ],
      },
    },
  });

  // Create messages
  await Promise.all([
    prisma.message.create({
      data: {
        schoolId: school.id,
        convId: conversation.id,
        senderId: teacherUser.id,
        content: 'Hello! I wanted to discuss Alice\'s progress in Mathematics.',
        isRead: true,
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        fileUrls: [],
        type: 'TEXT',
      },
    }),
    prisma.message.create({
      data: {
        schoolId: school.id,
        convId: conversation.id,
        senderId: parentUsers[0].user.id,
        content: 'Hi Ms. Johnson! Yes, I\'d love to hear about her progress.',
        isRead: true,
        sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        fileUrls: [],
        type: 'TEXT',
      },
    }),
  ]);
  console.log(`✅ Created conversation with ${2} messages`);

  // 15. Create Notifications
  console.log('🔔 Creating Notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: teacherUser.id,
        schoolId: school.id,
        title: 'New Assignment Submission',
        body: 'Alice Johnson submitted Homework #4',
        type: 'ASSIGNMENT',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: teacherUser.id,
        schoolId: school.id,
        title: 'Grade Appeal',
        body: 'Bob Smith appealed their grade for Quiz 5',
        type: 'GRADE',
        isRead: false,
      },
    }),
  ]);
  console.log(`✅ Created notifications`);

  // 15. Create Notes
  console.log('\n📝 Creating Notes...');
  const notes = await Promise.all([
    prisma.note.create({
      data: {
        schoolId: school.id,
        createdById: teacherUser.id,
        title: 'Introduction to Quadratic Equations',
        description: 'Complete notes covering standard form, vertex form, factoring, and graphing of quadratic equations with examples and practice problems.',
        subject: 'Mathematics',
        grade: 'Grade 10-A',
        chapter: 'Chapter 4: Quadratic Equations',
        type: 'PDF',
        fileUrl: 'https://example.com/quadratic-equations.pdf',
        fileSize: '2.4 MB',
        views: 145,
        downloads: 89,
      },
    }),
    prisma.note.create({
      data: {
        schoolId: school.id,
        createdById: teacherUser.id,
        title: 'Cell Structure and Functions',
        description: 'Detailed notes on prokaryotic and eukaryotic cells, organelles, cell membrane structure, and cellular functions.',
        subject: 'Biology',
        grade: 'Grade 11-B',
        chapter: 'Chapter 2: Cell Biology',
        type: 'PDF',
        fileUrl: 'https://example.com/cell-structure.pdf',
        fileSize: '3.8 MB',
        views: 198,
        downloads: 134,
      },
    }),
    prisma.note.create({
      data: {
        schoolId: school.id,
        createdById: teacherUser.id,
        title: 'Newton\'s Laws of Motion - Video Lecture',
        description: 'Comprehensive video lecture explaining Newton\'s three laws with real-world applications and demonstrations.',
        subject: 'Physics',
        grade: 'Grade 9-A',
        chapter: 'Chapter 5: Laws of Motion',
        type: 'VIDEO',
        fileUrl: 'https://example.com/newtons-laws.mp4',
        fileSize: '156 MB',
        views: 267,
        downloads: 45,
      },
    }),
    prisma.note.create({
      data: {
        schoolId: school.id,
        createdById: teacherUser.id,
        title: 'Photosynthesis Process Diagram',
        description: 'High-resolution diagram showing the light and dark reactions of photosynthesis with detailed labels.',
        subject: 'Biology',
        grade: 'Grade 10-A',
        chapter: 'Chapter 6: Photosynthesis',
        type: 'IMAGE',
        fileUrl: 'https://example.com/photosynthesis.jpg',
        fileSize: '1.2 MB',
        views: 312,
        downloads: 201,
      },
    }),
    prisma.note.create({
      data: {
        schoolId: school.id,
        createdById: teacherUser.id,
        title: 'Chemical Bonding Presentation',
        description: 'PowerPoint presentation covering ionic, covalent, and metallic bonding with interactive examples.',
        subject: 'Chemistry',
        grade: 'Grade 11-A',
        chapter: 'Chapter 3: Chemical Bonding',
        type: 'PRESENTATION',
        fileUrl: 'https://example.com/chemical-bonding.pptx',
        fileSize: '5.6 MB',
        views: 178,
        downloads: 92,
      },
    }),
    prisma.note.create({
      data: {
        schoolId: school.id,
        createdById: teacherUser.id,
        title: 'Trigonometry Formulas and Identities',
        description: 'Comprehensive list of trigonometric formulas, identities, and their derivations with solved examples.',
        subject: 'Mathematics',
        grade: 'Grade 11-B',
        chapter: 'Chapter 7: Trigonometry',
        type: 'PDF',
        fileUrl: 'https://example.com/trigonometry.pdf',
        fileSize: '1.8 MB',
        views: 223,
        downloads: 156,
      },
    }),
    prisma.note.create({
      data: {
        schoolId: school.id,
        createdById: teacherUser.id,
        title: 'English Literature Study Guide',
        description: 'Comprehensive study guide for Shakespeare\'s works including character analysis, themes, and important quotes.',
        subject: 'English',
        grade: 'Grade 12-A',
        chapter: 'Chapter 8: Shakespeare',
        type: 'DOCUMENT',
        fileUrl: 'https://example.com/shakespeare-guide.docx',
        fileSize: '2.1 MB',
        views: 156,
        downloads: 98,
      },
    }),
  ]);
  console.log(`✅ Created ${notes.length} notes`);

  console.log('\n✨ Hope Haven School seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - School: ${school.name}`);
  console.log(`   - Academic Term: ${term.name}`);
  console.log(`   - Classes: ${classes.length}`);
  console.log(`   - Subjects: ${subjects.length}`);
  console.log(`   - Teachers: ${1 + additionalTeachers.length} (1 primary + ${additionalTeachers.length} additional)`);
  console.log(`   - School Admins: 2`);
  console.log(`   - Parents: ${parentUsers.length}`);
  console.log(`   - Students: ${students.length}`);
  console.log(`   - Assignments: ${assignments.length}`);
  console.log(`   - Submissions: ${submissions.length}`);
  console.log(`   - Grades: ${grades.length}`);
  console.log(`   - Attendance Records: ${attendanceRecords.length}`);
  console.log(`   - Timetable Slots: ${timetableSlots.length}`);
  console.log(`   - Grade Appeals: ${gradeAppeals.length}`);
  console.log(`   - Notes: ${notes.length}`);
  console.log(`   - Conversations: 1`);
  console.log('\n🔐 Test Credentials:');
  console.log(`   Primary Teacher: ms.johnson@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Teacher 2: mr.smith@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Teacher 3: dr.garcia@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Teacher 4: mrs.taylor@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   School Admin (Principal): admin.principal@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   School Admin (Registrar): admin.registrar@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Parent 1: parent.john@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Parent 2: parent.sarah@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Parent 3: parent.michael@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Student: alice.johnson@hopehaven.com / ${STANDARD_PASSWORD}`);

  // 20. Create School Settings with time slots
  console.log('⚙️ Creating School Settings...');
  const schoolSettings = await prisma.schoolSettings.upsert({
    where: { schoolId: school.id },
    update: {
      timeSlots: [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
      ],
      periodDuration: 60,
      breakTime: '10:00',
      lunchTime: '12:00',
    },
    create: {
      schoolId: school.id,
      timeSlots: [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
      ],
      periodDuration: 60,
      breakTime: '10:00',
      lunchTime: '12:00',
    },
  });
  console.log(`✅ School Settings: Time slots configured`);
  console.log(`   Time Slots: ${schoolSettings.timeSlots.join(', ')}`);
  console.log(`   Period Duration: ${schoolSettings.periodDuration} minutes`);
  console.log(`   Break Time: ${schoolSettings.breakTime}`);
  console.log(`   Lunch Time: ${schoolSettings.lunchTime}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
