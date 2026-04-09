import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ChildOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const studentId = request.params.studentId;

    if (!user || !studentId) return true; // Let other guards handle missing user, skip if no studentId param

    // Find the parent profile for this user
    const parent = await this.prisma.parent.findUnique({
      where: { userId: user.sub },
    });

    if (!parent) {
      throw new ForbiddenException('User does not have a parent profile');
    }

    // Check verified relationship
    const relation = await this.prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: parent.id,
          studentId: studentId,
        },
      },
    });

    if (!relation) {
      throw new ForbiddenException('No relationship found with this student');
    }

    if (!relation.verified) {
      throw new ForbiddenException('Your parent-student relationship is not yet verified');
    }

    return true;
  }
}
