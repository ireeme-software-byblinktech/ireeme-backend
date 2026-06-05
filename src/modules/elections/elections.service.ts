import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ElectionsRepository } from './elections.repository';
import { CreateElectionDto } from './dto/create-election.dto';
import { AddCandidateDto } from './dto/add-candidate.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { ElectionStatus } from '@prisma/client';

@Injectable()
export class ElectionsService {
  constructor(private readonly repo: ElectionsRepository) { }

  async createElection(schoolId: string, dto: CreateElectionDto) {
    return this.repo.createElection({
      schoolId,
      title: dto.title,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
      positions: dto.positions,
    });
  }

  async addCandidate(schoolId: string, dto: AddCandidateDto) {
    const position = await this.repo.findPositionById(dto.positionId, schoolId);
    if (!position) throw new NotFoundException('Election position not found');

    // Check if student is already a candidate in this election
    const existing = await this.repo.prisma.candidate.findFirst({
      where: {
        position: { electionId: position.electionId },
        studentId: dto.studentId
      },
    });
    if (existing) throw new ConflictException('Student is already a candidate in this election');

    return this.repo.addCandidate({
      schoolId,
      positionId: dto.positionId,
      studentId: dto.studentId,
      bio: dto.bio,
      imageUrl: dto.imageUrl,
    });
  }

  async castVote(schoolId: string, userId: string, dto: CastVoteDto) {
    const position = await this.repo.findPositionById(dto.positionId, schoolId);
    if (!position) throw new NotFoundException('Position not found');

    // Only check if election is ACTIVE, not the dates
    if (position.election.status !== ElectionStatus.ACTIVE) {
      throw new BadRequestException('Election is not currently open for voting');
    }

    // Get the student record from userId
    const student = await this.repo.prisma.student.findFirst({
      where: { userId, schoolId },
    });
    if (!student) throw new NotFoundException('Student record not found');

    // Check if candidate belongs to this position
    const candidate = await this.repo.prisma.candidate.findFirst({
      where: { id: dto.candidateId, positionId: dto.positionId },
    });
    if (!candidate) throw new BadRequestException('Invalid candidate for this position');

    try {
      return await this.repo.castVote({
        schoolId,
        positionId: dto.positionId,
        candidateId: dto.candidateId,
        studentId: student.id,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('You have already voted for this position');
      }
      throw error;
    }
  }

  async getResults(electionId: string, schoolId: string) {
    const election = await this.repo.findElectionById(electionId, schoolId);
    if (!election) throw new NotFoundException('Election not found');

    const results = await this.repo.getResults(electionId, schoolId);

    // Calculate total votes for each position
    const positions = results.map(pos => {
      const totalVotes = pos.candidates.reduce((sum, cand) => sum + cand._count.votes, 0);

      return {
        positionId: pos.id,
        positionTitle: pos.name,
        totalVotes,
        candidates: pos.candidates.map(cand => {
          const voteCount = cand._count.votes;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

          return {
            candidateId: cand.id,
            studentName: `${cand.student.user.firstName} ${cand.student.user.lastName}`,
            voteCount,
            percentage,
          };
        }).sort((a, b) => b.voteCount - a.voteCount), // Sort by vote count descending
      };
    });

    return {
      electionId,
      positions,
    };
  }

  findAll(schoolId: string) {
    return this.repo.findAll(schoolId);
  }

  findOne(id: string, schoolId: string) {
    return this.repo.findElectionById(id, schoolId);
  }

  async addPosition(
    schoolId: string,
    electionId: string,
    dto: { name: string; minVotes?: number; maxVotes?: number },
  ) {
    const election = await this.repo.findElectionById(electionId, schoolId);
    if (!election) throw new NotFoundException('Election not found');

    return this.repo.addPosition({
      schoolId,
      electionId,
      name: dto.name,
      minVotes: dto.minVotes || 1,
      maxVotes: dto.maxVotes || 1,
    });
  }

  async openVoting(electionId: string, schoolId: string) {
    const election = await this.repo.findElectionById(electionId, schoolId);
    if (!election) throw new NotFoundException('Election not found');

    if (election.status === ElectionStatus.ACTIVE) {
      throw new BadRequestException('Election is already active');
    }

    // Set startAt to now and endAt to 7 days from now if not already set or if dates are invalid
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startAt = election.startAt && election.startAt <= now ? election.startAt : now;
    const endAt = election.endAt && election.endAt > now ? election.endAt : sevenDaysFromNow;

    // Update election with status and valid dates
    return this.repo.prisma.election.update({
      where: { id: electionId, schoolId },
      data: {
        status: ElectionStatus.ACTIVE,
        startAt,
        endAt,
      },
      include: {
        positions: {
          include: {
            candidates: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async closeVoting(electionId: string, schoolId: string) {
    const election = await this.repo.findElectionById(electionId, schoolId);
    if (!election) throw new NotFoundException('Election not found');

    if (election.status === ElectionStatus.CLOSED) {
      throw new BadRequestException('Election is already closed');
    }

    return this.repo.updateElectionStatus(electionId, schoolId, ElectionStatus.CLOSED);
  }

  async publishResults(electionId: string, schoolId: string) {
    const election = await this.repo.findElectionById(electionId, schoolId);
    if (!election) throw new NotFoundException('Election not found');

    if (election.status !== ElectionStatus.CLOSED) {
      throw new BadRequestException('Can only publish results for closed elections');
    }

    return this.repo.prisma.election.update({
      where: { id: electionId, schoolId },
      data: { resultsPublished: true },
      include: {
        positions: {
          include: {
            candidates: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async unpublishResults(electionId: string, schoolId: string) {
    const election = await this.repo.findElectionById(electionId, schoolId);
    if (!election) throw new NotFoundException('Election not found');

    return this.repo.prisma.election.update({
      where: { id: electionId, schoolId },
      data: { resultsPublished: false },
      include: {
        positions: {
          include: {
            candidates: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getVotingStatus(electionId: string, schoolId: string, userId: string) {
    const election = await this.repo.findElectionById(electionId, schoolId);
    if (!election) throw new NotFoundException('Election not found');

    // Get the student record from userId
    const student = await this.repo.prisma.student.findFirst({
      where: { userId, schoolId },
    });
    if (!student) throw new NotFoundException('Student record not found');

    // Check if student has voted in any position of this election
    const votes = await this.repo.prisma.vote.findMany({
      where: {
        studentId: student.id,
        position: {
          electionId,
        },
      },
    });

    return {
      hasVoted: votes.length > 0,
      votedPositions: votes.length,
      totalPositions: election.positions.length,
    };
  }
}
