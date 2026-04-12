import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.quote.findMany({
      where: { userId },
      include: { client: true, lines: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { id },
      include: { client: true, lines: true },
    });
    if (!quote) throw new NotFoundException('Devis introuvable');
    if (quote.userId !== userId) throw new ForbiddenException();
    return quote;
  }

  async findByShareToken(shareToken: string) {
    const quote = await this.prisma.quote.findUnique({
      where: { shareToken },
      include: { client: true, lines: true },
    });
    if (!quote) throw new NotFoundException('Devis introuvable');
    return quote;
  }

  async create(userId: string, dto: CreateQuoteDto) {
    const number = await this.generateNumber();
    const { lines, validUntil, ...rest } = dto;

    return this.prisma.quote.create({
      data: {
        ...rest,
        number,
        userId,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        lines: {
          create: lines,
        },
      },
      include: { client: true, lines: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateQuoteDto) {
    await this.findOne(id, userId);
    const { lines, validUntil, ...rest } = dto;

    return this.prisma.quote.update({
      where: { id },
      data: {
        ...rest,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        ...(lines && {
          lines: {
            deleteMany: {},
            create: lines,
          },
        }),
      },
      include: { client: true, lines: true },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.quote.delete({ where: { id } });
  }

  async generateShareToken(id: string, userId: string) {
    await this.findOne(id, userId);
    const shareToken = randomUUID();
    const quote = await this.prisma.quote.update({
      where: { id },
      data: { shareToken },
    });
    return { shareToken: quote.shareToken };
  }

  private async generateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count();
    const seq = String(count + 1).padStart(4, '0');
    return `DEVIS-${year}-${seq}`;
  }
}
