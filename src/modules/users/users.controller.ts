import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Req() req: any) {
    const { sub: userId } = req.user;
    console.log('[GET PROFILE] userId:', userId);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('[GET PROFILE] user:', user);
    return user;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @Req() req: any,
    @Body() data: { firstName?: string; lastName?: string; phoneNumber?: string },
  ) {
    const { sub: userId } = req.user;
    
    console.log('[UPDATE PROFILE] userId:', userId);
    console.log('[UPDATE PROFILE] data:', data);

    // Validation
    if (data.firstName && !data.firstName.trim()) {
      throw new BadRequestException('First name cannot be empty');
    }
    if (data.lastName && !data.lastName.trim()) {
      throw new BadRequestException('Last name cannot be empty');
    }

    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName.trim();
    if (data.lastName !== undefined) updateData.lastName = data.lastName.trim();
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber?.trim() || null;

    console.log('[UPDATE PROFILE] updateData:', updateData);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('[UPDATE PROFILE] updated user:', updated);
    return updated;
  }
}
