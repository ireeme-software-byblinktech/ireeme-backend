import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

// email is identity — not updatable after creation
export class UpdateStudentDto extends PartialType(OmitType(CreateStudentDto, ['email'] as const)) {}
