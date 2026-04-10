import { PrismaService } from './prisma.service';

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
}
