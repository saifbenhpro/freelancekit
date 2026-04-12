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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('clients')
export class ClientsController {
  constructor(private clients: ClientsService) {}

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.clients.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.clients.findOne(id, userId);
  }

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateClientDto) {
    return this.clients.create(userId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() dto: UpdateClientDto,
  ) {
    return this.clients.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.clients.remove(id, userId);
  }
}
