import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { ElectionStatus } from '@prisma/client';

@Injectable()
export class ElectionsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async createElection(data: {
    schoolId: string;
    title: string;
    startAt: Date;
    endAt: Date;
    positions: { name: string; minVotes?: number; maxVotes?: number }[];
  }) {
    return this.prisma.election.create({
      data: {
        schoolId: data.schoolId,
        title: data.title,
        startAt: data.startAt,
        endAt: data.endAt,
        positions: {
          create: data.positions.map((p) => ({
            schoolId: data.schoolId,
            name: p.name,
            minVotes: p.minVotes,
            maxVotes: p.maxVotes,
          })),
        },
      },
      include: { positions: true },
    });
  }

  async addCandidate(data: {
    schoolId: string;
    positionId: string;
    studentId: string;
    bio?: string;
    imageUrl?: string;
  }) {
    return this.prisma.candidate.create({
      data: {
        schoolId: data.schoolId,
        positionId: data.positionId,
        studentId: data.studentId,
        bio: data.bio,
        imageUrl: data.imageUrl,
      },
    });
  }

  async findElectionById(id: string, schoolId: string) {
    return this.prisma.election.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: {
        positions: {
          include: {
            candidates: {
              include: { student: { include: { user: true } } },
            },
          },
        },
      },
    });
  }

  async findPositionById(id: string, schoolId: string) {
    return this.prisma.electionPosition.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: { election: true },
    });
  }

  async castVote(data: {
    schoolId: string;
    positionId: string;
    candidateId: string;
    studentId: string;
  }) {
    return this.prisma.vote.create({
      data: {
        schoolId: data.schoolId,
        positionId: data.positionId,
        candidateId: data.candidateId,
        studentId: data.studentId,
      },
    });
  }

  async getResults(electionId: string, schoolId: string) {
    return this.prisma.electionPosition.findMany({
      where: { electionId, schoolId },
      include: {
        candidates: {
          include: {
            student: { include: { user: true } },
            _count: { select: { votes: true } },
          },
        },
      },
    });
  }

  async findAll(schoolId: string) {
    return this.prisma.election.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
