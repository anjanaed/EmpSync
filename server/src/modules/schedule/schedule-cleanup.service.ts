import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ScheduleCleanupService {
  private readonly logger = new Logger(ScheduleCleanupService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  // Runs every day at 2:00 AM
@Cron(CronExpression.EVERY_DAY_AT_2AM)
  // @Cron(CronExpression.EVERY_MINUTE)//for the checking
  async handleCleanup() {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const result = await this.databaseService.scheduledMeal.deleteMany({
      where: {
        date: { lt: twoWeeksAgo },
      },
    });

    this.logger.log(
      `Deleted ${result.count} scheduled meals older than two weeks`,
    );
  }
}
