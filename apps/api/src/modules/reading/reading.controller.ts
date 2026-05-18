import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateReadingAttemptDto } from './dto/create-reading-attempt.dto';
import { CreateReadingSessionDto } from './dto/create-reading-session.dto';
import { ReadingService } from './reading.service';

@Controller('reading')
export class ReadingController {
  constructor(private readonly service: ReadingService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Post('sessions')
  createSession(@Body() body: CreateReadingSessionDto) {
    return this.service.createSession(body);
  }

  @Post('sessions/:sessionId/attempts')
  createAttempt(
    @Param('sessionId') sessionId: string,
    @Body() body: CreateReadingAttemptDto,
  ) {
    return this.service.createAttempt(sessionId, body);
  }
}
