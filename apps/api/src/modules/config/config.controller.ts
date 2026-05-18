import { Body, Controller, Get, Put } from '@nestjs/common';
import { ConfigService } from './config.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Controller('config')
export class ConfigController {
  constructor(private readonly service: ConfigService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Get('preferences')
  getPreferences() {
    return this.service.getPreferences();
  }

  @Put('preferences')
  updatePreferences(@Body() body: UpdatePreferencesDto) {
    return this.service.updatePreferences(body);
  }
}
