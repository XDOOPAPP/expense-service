import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum DebtType {
  OWE = 'owe',
  OWED = 'owed',
}

export class CreateDebtDto {
  @IsString()
  person: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsEnum(DebtType)
  type: DebtType;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class UpdateDebtDto {
  @IsOptional()
  @IsString()
  person?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(DebtType)
  type?: DebtType;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  isPaid?: boolean;
}
