import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// Service for handling fingerprint-related business logic
@Injectable()
export class OrderTabFingerprintService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Lookup user by thumbId (Bytes)
  async getUserByThumbId(thumbId: string) {
    try {
      let hex = thumbId.startsWith('\\x') ? thumbId.slice(2) : thumbId;
      const thumbIdBuffer = Buffer.from(hex, 'hex');

      const user = await this.databaseService.user.findUnique({
        where: { thumbId: thumbIdBuffer },
        select: {
          id: true,
          name: true, // Add this line to include the name
        },
      });

      if (user) {
        return user;
      } else {
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
