import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ElectionsRepository } from './elections.repository';
import { CreateElectionDto } from './dto/create-election.dto';
import { AddCandidateDto } from './dto/add-candidate.dto';
import { CastVoteDto } from './dto/cast-vote.dto';
import { ElectionStatus } from '@prisma/client';

@Injectable()
export class ElectionsService {
  constructor(private readonly repo: ElectionsRepository) {}

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

  async castVote(schoolId: string, studentId: string, dto: CastVoteDto) {
    const position = await this.repo.findPositionById(dto.positionId, schoolId);
    if (!position) throw new NotFoundException('Position not found');

    const now = new Date();
    if (position.election.status !== ElectionStatus.ACTIVE) {
      throw new BadRequestException('Election is not currently active');
    }
    if (now < position.election.startAt || now > position.election.endAt) {
      throw new BadRequestException('Election is outside of voting period');
    }

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
        studentId,
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
    
    // Transform to a clean results format
    return results.map(pos => ({
      positionId: pos.id,
      positionName: pos.name,
      candidates: pos.candidates.map(cand => ({
        candidateId: cand.id,
        name: `${cand.student.user.firstName} ${cand.student.user.lastName}`,
        votes: cand._count.votes,
      })).sort((a, b) => b.votes - a.votes)
    }));
  }

  findAll(schoolId: string) {
    return this.repo.findAll(schoolId);
  }

  findOne(id: string, schoolId: string) {
    return this.repo.findElectionById(id, schoolId);
  }
}
