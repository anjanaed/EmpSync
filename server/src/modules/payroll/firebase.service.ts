import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: admin.storage.Storage;

  onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: '<YOUR_PROJECT_ID>',
        clientEmail: '<YOUR_CLIENT_EMAIL>',
        privateKey: '<YOUR_PRIVATE_KEY>'.replace(/\\n/g, '\n'),
      }),
      storageBucket: '<YOUR_BUCKET>.appspot.com',
    });
    this.bucket = admin.storage();
  }

async uploadFile(employeeId: string, filename: string, buffer: Buffer): Promise<string> {
  const filePath = `payrolls/${employeeId}/${filename}`;
  const file = this.bucket.bucket().file(filePath);
  await file.save(buffer, {
    contentType: 'application/pdf',
    metadata: {
      firebaseStorageDownloadTokens: employeeId,
    },
  });
  return filePath;
}

  async getSignedUrl(filePath: string): Promise<string> {
    const file = this.bucket.bucket().file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    });
    return url;
  }
}
