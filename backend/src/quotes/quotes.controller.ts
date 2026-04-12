import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(private quotes: QuotesService) {}

  // Public route — share token access (no auth required)
  @Get('public/:shareToken')
  findPublic(@Param('shareToken') shareToken: string) {
    return this.quotes.findByShareToken(shareToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.quotes.findAll(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.quotes.findOne(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateQuoteDto) {
    return this.quotes.create(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateQuoteDto,
  ) {
    return this.quotes.update(id, userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.quotes.remove(id, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/share-token')
  generateShareToken(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.quotes.generateShareToken(id, userId);
  }
}
