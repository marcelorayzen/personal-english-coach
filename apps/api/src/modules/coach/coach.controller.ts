import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CreateCoachSessionDto } from './dto/create-coach-session.dto';
import { CreateCoachTurnDto } from './dto/create-coach-turn.dto';

@Controller('coach')
export class CoachController {
  constructor(private readonly service: CoachService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Post('sessions')
  createSession(@Body() body: CreateCoachSessionDto) {
    return this.service.createSession(body);
  }

  @Post('sessions/:sessionId/turns')
  createTurn(
    @Param('sessionId') sessionId: string,
    @Body() body: CreateCoachTurnDto,
  ) {
    return this.service.createTurn(sessionId, body);
  }

  @Get('sessions/:sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.service.getSession(sessionId);
  }
}
