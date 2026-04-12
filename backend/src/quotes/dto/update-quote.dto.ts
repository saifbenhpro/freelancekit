import { QuoteStatus } from '@prisma/client';
import { QuoteLineDto } from './create-quote.dto';

export class UpdateQuoteDto {
  clientId?: string;
  lines?: QuoteLineDto[];
  taxRate?: number;
  validUntil?: string;
  note?: string;
  status?: QuoteStatus;
}
