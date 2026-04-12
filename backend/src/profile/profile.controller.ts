import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('profile')
export class ProfileController {
  constructor(private profile: ProfileService) {}

  @Get()
  getProfile(@GetUser('id') userId: string) {
    return this.profile.getProfile(userId);
  }

  @Patch()
  updateProfile(@GetUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.profile.updateProfile(userId, dto);
  }
}
