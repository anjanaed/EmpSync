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
  async createFingerprint(thumbid: string, empId: string) {
    return this.prisma.fingerprint.create({
      data: {
        thumbid,
        empId,
      },
    });
  }
  async getFingerprintByThumbid(thumbid: string) {
    return this.prisma.fingerprint.findUnique({
      where: { thumbid },
      select: { empId: true },
    });
  }
}
