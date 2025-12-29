import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';

interface ExpenseData {
    amount: number;
    description: string;
    spentAt: Date;
    category?: string;
    confidence: number;
}

interface OcrCompletedEvent {
    jobId: string;
    userId: string;
    expenseData: ExpenseData;
    fileUrl: string;
}

@Injectable()
export class OcrEventListener {
    private readonly logger = new Logger(OcrEventListener.name);

    constructor(private prisma: PrismaService) { }

    @EventPattern('ocr.completed')
    async handleOcrCompleted(@Payload() event: OcrCompletedEvent) {
        this.logger.log(
            `Received OCR completed event for job ${event.jobId}, user ${event.userId}`,
        );

        try {
            await this.createExpenseFromOcr(event);
            this.logger.log(
                `Successfully created expense from OCR job ${event.jobId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to create expense from OCR job ${event.jobId}: ${error.message}`,
                error.stack,
            );
        }
    }

    private async createExpenseFromOcr(
        event: OcrCompletedEvent,
    ): Promise<void> {
        const { jobId, userId, expenseData } = event;

        // Validate expense data
        if (!expenseData.amount || expenseData.amount <= 0) {
            throw new Error('Invalid amount from OCR result');
        }

        // Create expense record
        const expense = await this.prisma.expense.create({
            data: {
                userId,
                description: expenseData.description || 'OCR Scanned Receipt',
                amount: expenseData.amount,
                category: expenseData.category,
                spentAt: new Date(expenseData.spentAt),
                ocrJobId: jobId,
                isFromOcr: true,
                ocrConfidence: expenseData.confidence,
            },
        });

        this.logger.log(
            `Created expense ${expense.id} from OCR job ${jobId} with confidence ${expenseData.confidence}%`,
        );
    }
}
