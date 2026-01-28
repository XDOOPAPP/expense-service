import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Description of the expense',
    example: 'Lunch at restaurant',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @ApiProperty({
    description: 'Amount of the expense',
    example: 150000,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Category slug (optional)',
    example: 'food',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Date when expense was made (ISO 8601 format)',
    example: '2024-12-13',
  })
  @IsDateString()
  spentAt: string;

  @ApiProperty({
    description: 'Receipt image URL (optional)',
    example: 'https://example.com/receipt.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiProperty({
    description: 'Additional notes (optional)',
    example: 'Business lunch',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Location of expense (optional)',
    example: 'Restaurant ABC',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Payment method (cash, card, transfer)',
    example: 'card',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({
    description: 'Tags for categorization',
    example: ['lunch', 'work'],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
