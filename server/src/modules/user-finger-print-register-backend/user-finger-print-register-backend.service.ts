import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserFingerPrintRegisterBackendService {
  private prisma = new PrismaClient();

  async getUserByPasskey(passkey: number) {
    return this.prisma.user.findFirst({
      where: { passkey },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
