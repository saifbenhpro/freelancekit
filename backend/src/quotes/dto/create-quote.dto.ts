export class QuoteLineDto {
  description: string;
  detail?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discount?: number;
  order?: number;
}

export class CreateQuoteDto {
  clientId: string;
  lines: QuoteLineDto[];
  taxRate?: number;
  validUntil?: string;
  note?: string;
}
