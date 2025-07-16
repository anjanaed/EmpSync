import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class HrFingerprintsService {
  private prisma = new PrismaClient();

  async getAllFingerprints(orgId?: string) {
    return this.prisma.fingerprint.findMany({
      where: orgId ? { orgId } : undefined,
      select: {
        thumbid: true,
        empId: true,
        orgId: true,
      },
    });
  }

  async getThumbidsByEmpId(empId: string) {
    const fingerprints = await this.prisma.fingerprint.findMany({
      where: { empId },
      select: { thumbid: true },
    });
    return fingerprints.map((fp) => fp.thumbid);
  }

  async deleteFingerprintByThumbid(thumbid: string) {
    return this.prisma.fingerprint.delete({
      where: { thumbid },
    });
  }

  async deleteFingerprintsByEmpId(empId: string) {
    return this.prisma.fingerprint.deleteMany({
      where: { empId },
    });
  }

  async getAllUsersWithFingerprintStatus() {
    // Get all users (id, name)
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true },
    });

    // Get all registered empIds from Fingerprint table
    const fingerprints = await this.prisma.fingerprint.findMany({
      select: { empId: true },
    });
    const registeredEmpIds = new Set(fingerprints.map((fp) => fp.empId));

    // Map users to include status
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      status: registeredEmpIds.has(user.id) ? 'Registered' : 'Unregistered',
    }));
  }

  async getAllUsersWithFingerprintDetails(orgId?: string) {
  // Get all users (id, name, passkey) filtered by orgId if provided
  const users = await this.prisma.user.findMany({
    where: orgId ? { organizationId: orgId } : undefined,
    select: { id: true, name: true, passkey: true },
  });

  // Get all fingerprints for users in this org
  const userIds = users.map(u => u.id);
  const fingerprints = await this.prisma.fingerprint.findMany({
    where: { empId: { in: userIds } },
    select: { thumbid: true, empId: true },
  });

  // Group fingerprints by empId
  const fpMap = new Map();
  fingerprints.forEach((fp) => {
    if (!fpMap.has(fp.empId)) fpMap.set(fp.empId, []);
    fpMap.get(fp.empId).push(fp.thumbid);
  });

  // Map users to include status, count, and thumbids
  return users.map((user) => {
    const thumbids = fpMap.get(user.id) || [];
    return {
      id: user.id,
      name: user.name,
      passkey: user.passkey,
      status: thumbids.length > 0 ? 'Registered' : 'Unregistered',
      fingerprintCount: thumbids.length,
      thumbids,
    };
  });
}
}
