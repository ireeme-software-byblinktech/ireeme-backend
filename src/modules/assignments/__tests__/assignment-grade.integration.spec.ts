import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { PrismaService } from '../../../database/prisma.service';

describe('Assignment-Grade Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let schoolId: string;
  let teacherToken: string;
  let studentToken: string;
  let teacherUserId: string;
  let studentUserId: string;
  let teacherId: string;
  let studentId: string;
  let subjectId: string;
  let classId: string;
  let termId: string;
  let assignmentId: string;
  let submissionId: string;
  let gradeId: string;
  let appealId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create school
    const school = await prisma.school.create({
      data: { name: 'Test School', code: `TEST-${Date.now()}` },
    });
    schoolId = school.id;

    // Create term
    const term = await prisma.academicTerm.create({
      data: {
        schoolId,
        name: 'Term 1 2026',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-04-30'),
        isActive: true,
      },
    });
    termId = term.id;

    // Create class
    const classRecord = await prisma.class.create({
      data: {
        schoolId,
        name: 'Grade 10A',
        year: 2026,
        termId,
      },
    });
    classId = classRecord.id;

    // Create subject
    const subject = await prisma.subject.create({
      data: {
        schoolId,
        name: 'Mathematics',
        code: 'MATH101',
        classId,
      },
    });
    subjectId = subject.id;

    // Create teacher
    const teacherUser = await prisma.user.create({
      data: {
        schoolId,
        email: `teacher-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Teacher',
        lastName: 'Test',
      },
    });
    teacherUserId = teacherUser.id;

    await prisma.userRole.create({
      data: { userId: teacherUserId, schoolId, role: 'TEACHER' },
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: teacherUserId,
        schoolId,
        employeeNum: `TEACH-${Date.now()}`,
      },
    });
    teacherId = teacher.id;

    // Create student
    const studentUser = await prisma.user.create({
      data: {
        schoolId,
        email: `student-${Date.now()}@test.com`,
        passwordHash,
        firstName: 'Student',
        lastName: 'Test',
      },
    });
    studentUserId = studentUser.id;

    await prisma.userRole.create({
      data: { userId: studentUserId, schoolId, role: 'STUDENT' },
    });

    const student = await prisma.student.create({
      data: {
        userId: studentUserId,
        schoolId,
        studentNumber: `STU-${Date.now()}`,
        enrollmentDate: new Date(),
      },
    });
    studentId = student.id;

    // Get tokens
    const teacherLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: teacherUser.email, password: 'password123' });
    teacherToken = teacherLogin.body.accessToken;

    const studentLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: studentUser.email, password: 'password123' });
    studentToken = studentLogin.body.accessToken;
  });

  afterAll(async () => {
    await prisma.gradeAppeal.deleteMany({ where: { schoolId } });
    await prisma.grade.deleteMany({ where: { schoolId } });
    await prisma.submission.deleteMany({ where: { schoolId } });
    await prisma.assignment.deleteMany({ where: { schoolId } });
    await prisma.teacherSubject.deleteMany({ where: { schoolId } });
    await prisma.subject.deleteMany({ where: { schoolId } });
    await prisma.classStudent.deleteMany({ where: { schoolId } });
    await prisma.class.deleteMany({ where: { schoolId } });
    await prisma.student.deleteMany({ where: { schoolId } });
    await prisma.teacher.deleteMany({ where: { schoolId } });
    await prisma.userRole.deleteMany({ where: { schoolId } });
    await prisma.refreshToken.deleteMany({ where: { schoolId } });
    await prisma.user.deleteMany({ where: { schoolId } });
    await prisma.academicTerm.deleteMany({ where: { schoolId } });
    await prisma.school.delete({ where: { id: schoolId } });
    await app.close();
  });

  it('POST /assignments with TEACHER token → 201, body has id and dueAt', async () => {
    const response = await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        subjectId,
        title: 'Homework 1',
        description: 'Complete exercises 1-10',
        type: 'HOMEWORK',
        maxScore: 100,
        weight: 1.0,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        allowLate: false,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('dueAt');
    assignmentId = response.body.id;
  });

  it('POST /assignments with dueAt in the past → 400', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        subjectId,
        title: 'Past Assignment',
        type: 'HOMEWORK',
        maxScore: 100,
        weight: 1.0,
        dueAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        allowLate: false,
      })
      .expect(400);
  });

  it('POST /assignments without token → 401', async () => {
    await request(app.getHttpServer())
      .post('/assignments')
      .send({
        subjectId,
        title: 'Unauthorized Assignment',
        type: 'HOMEWORK',
        maxScore: 100,
        weight: 1.0,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(401);
  });

  it('POST /assignments/:id/submit with STUDENT token → 201, body has submissionId', async () => {
    const response = await request(app.getHttpServer())
      .post(`/assignments/${assignmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        content: 'My submission content',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    submissionId = response.body.id;
  });

  it('POST /assignments/:id/submit twice (same student) → 200 (upsert)', async () => {
    await request(app.getHttpServer())
      .post(`/assignments/${assignmentId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        content: 'Updated submission content',
      })
      .expect(201);
  });

  it('PATCH /grades/submissions/:id/grade with TEACHER token → 200, body has score and feedback', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/grades/submissions/${submissionId}/grade`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        score: 85,
        maxScore: 100,
        feedback: 'Good work!',
        termId,
      })
      .expect(200);

    expect(response.body).toHaveProperty('score');
    expect(response.body).toHaveProperty('feedback');
    gradeId = response.body.id;
  });

  it('GET /grades/student/:studentId/:termId → 200, body has grades array and gpa', async () => {
    const response = await request(app.getHttpServer())
      .get(`/grades/student/${studentId}/${termId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('grades');
    expect(response.body).toHaveProperty('gpa');
    expect(Array.isArray(response.body.grades)).toBe(true);
  });

  it('POST /grades/:id/appeal with STUDENT token → 201, body has status PENDING', async () => {
    const response = await request(app.getHttpServer())
      .post(`/grades/${gradeId}/appeal`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        reason: 'I believe question 5 was graded incorrectly',
      })
      .expect(201);

    expect(response.body).toHaveProperty('status', 'PENDING');
    appealId = response.body.id;
  });

  it('POST /grades/:id/appeal again (duplicate) → 409 conflict', async () => {
    const response = await request(app.getHttpServer())
      .post(`/grades/${gradeId}/appeal`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        reason: 'Another appeal',
      })
      .expect(409);

    expect(response.body).toHaveProperty('requestId');
  });

  it('PATCH /grades/appeals/:appealId with TEACHER token → 200, body has status APPROVED', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/grades/appeals/${appealId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        status: 'APPROVED',
      })
      .expect(200);

    expect(response.body).toHaveProperty('status', 'APPROVED');
  });
});
