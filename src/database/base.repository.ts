import { PrismaService } from './prisma.service';
import { PaginationDto, PaginatedResult, createPaginatedResponse } from '../common/dto/pagination.dto';

/**
 * BaseRepository enforces schoolId scoping on every query.
 * All module repositories MUST extend this class.
 */
export abstract class BaseRepository {
  constructor(public readonly prisma: PrismaService) {}

  /**
   * Merges schoolId into any where clause — prevents cross-school data leaks.
   */
  protected scopeToSchool<T extends object>(schoolId: string, where?: T): T & { schoolId: string } {
    return { ...(where ?? ({} as T)), schoolId };
  }

  /**
   * Helper for paginated queries
   */
  protected async paginate<T>(
    model: any,
    where: any,
    pagination: PaginationDto,
    options?: {
      select?: any;
      include?: any;
      orderBy?: any;
    },
  ): Promise<PaginatedResult<T>> {
    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        ...options,
      }),
      model.count({ where }),
    ]);

    return createPaginatedResponse(data, total, pagination.page, pagination.limit);
  }

  /**
   * Generate cache key for entity
   */
  protected getCacheKey(schoolId: string, entity: string, id?: string): string {
    return id 
      ? `school:${schoolId}:${entity}:${id}`
      : `school:${schoolId}:${entity}:list`;
  }
}
