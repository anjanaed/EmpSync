import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from '../../../database/database.service';

@Injectable()
export class ScheduledMealCronService {
  private readonly logger = new Logger(ScheduledMealCronService.name);

  constructor(private readonly prisma: DatabaseService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron('*/2 * * * *')
  async confirmScheduledMeals() {
    this.logger.log('Running scheduled meal confirmation...');

    try {
      const twoDaysLater = new Date();
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      twoDaysLater.setHours(0, 0, 0, 0); // Local midnight

      const result = await this.prisma.scheduledMeal.updateMany({
        where: {
          date: twoDaysLater, // Pass a Date object, not a string
          confirmed: false,
        },
        data: {
          confirmed: true,
        },
      });

      this.logger.log(`Confirmed ${result.count} scheduled meals.`);
    } catch (error) {
      this.logger.error('Error confirming scheduled meals', error.stack);
    }
  }
}
