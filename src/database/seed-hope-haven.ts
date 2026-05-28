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
  const school = await prisma.school.findFirst({
    where: { name: 'Hope haven school' },
  });

  if (!school) {
    throw new Error('❌ Hope Haven School not found in database. Please create it first.');
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
  console.log('👨‍🏫 Creating Teacher...');
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
  console.log(`✅ Teacher: ${teacherUser.firstName} ${teacherUser.lastName}`);

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
      return prisma.attendanceRecord.create({
        data: {
          schoolId: school.id,
          studentId: student.id,
          subjectId: subjects[0].id, // Mathematics
          date: new Date(today.getTime() - idx * 24 * 60 * 60 * 1000),
          status: statuses[idx % statuses.length],
          markedById: teacherUser.id,
          note: idx % 2 === 0 ? 'On time' : 'Late arrival',
        },
      });
    })
  );
  console.log(`✅ Created ${attendanceRecords.length} attendance records`);

  // 12. Create Timetable Slots
  console.log('⏰ Creating Timetable Slots...');
  const timetableSlots = await Promise.all([
    prisma.timetableSlot.create({
      data: {
        schoolId: school.id,
        classId: classes[0].id, // Grade 10-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        room: 'Room 101',
      },
    }),
    prisma.timetableSlot.create({
      data: {
        schoolId: school.id,
        classId: classes[1].id, // Grade 10-B
        subjectId: subjects[2].id, // Physics
        teacherId: teacher.id,
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        room: 'Lab 1',
      },
    }),
    prisma.timetableSlot.create({
      data: {
        schoolId: school.id,
        classId: classes[2].id, // Grade 11-A
        subjectId: subjects[0].id, // Mathematics
        teacherId: teacher.id,
        dayOfWeek: 3, // Wednesday
        startTime: '10:00',
        room: 'Room 102',
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
  console.log('💬 Creating Conversations...');
  const parentUser = await prisma.user.upsert({
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

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      schoolId: school.id,
      phone: '+250788654321',
      address: '123 Hope Street, Kigali',
    },
  });

  // Link parent to student
  await prisma.parentStudent.upsert({
    where: { id: `ps-${parent.id}-${students[0].id}` },
    update: {},
    create: {
      id: `ps-${parent.id}-${students[0].id}`,
      schoolId: school.id,
      parentId: parent.id,
      studentId: students[0].id,
      verified: true,
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      schoolId: school.id,
      members: {
        create: [
          { schoolId: school.id, userId: teacherUser.id },
          { schoolId: school.id, userId: parentUser.id },
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
        senderId: parentUser.id,
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

  console.log('\n✨ Hope Haven School seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - School: ${school.name}`);
  console.log(`   - Academic Term: ${term.name}`);
  console.log(`   - Classes: ${classes.length}`);
  console.log(`   - Subjects: ${subjects.length}`);
  console.log(`   - Teacher: ${teacherUser.firstName} ${teacherUser.lastName}`);
  console.log(`   - Students: ${students.length}`);
  console.log(`   - Assignments: ${assignments.length}`);
  console.log(`   - Submissions: ${submissions.length}`);
  console.log(`   - Grades: ${grades.length}`);
  console.log(`   - Attendance Records: ${attendanceRecords.length}`);
  console.log(`   - Timetable Slots: ${timetableSlots.length}`);
  console.log(`   - Grade Appeals: ${gradeAppeals.length}`);
  console.log(`   - Conversations: 1`);
  console.log('\n🔐 Test Credentials:');
  console.log(`   Teacher: ms.johnson@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Student: alice.johnson@hopehaven.com / ${STANDARD_PASSWORD}`);
  console.log(`   Parent: parent.john@hopehaven.com / ${STANDARD_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
