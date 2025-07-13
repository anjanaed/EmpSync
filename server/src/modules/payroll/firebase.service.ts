import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: admin.storage.Storage;

  onModuleInit() {
    try {
      // Firebase credentials removed - configure with environment variables
      // admin.initializeApp({
      //   credential: admin.credential.cert(
      //     './src/modules/payroll/firebase-credentials.json',
      //   ),
      //   storageBucket: 'gs://empsync-af358',
      // });
      // this.bucket = admin.storage();
      console.log('Firebase initialization disabled - credentials removed');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase Admin SDK');
    }
  }

  async uploadFile(
    employeeId: string,
    filename: string,
    buffer: Buffer,
  ): Promise<string> {
    throw new Error('Firebase service is disabled - credentials removed');
  }

  async checkStorageConnection(): Promise<{
    connected: boolean;
    message: string;
  }> {
    return {
      connected: false,
      message: 'Firebase service is disabled - credentials removed',
    };
  }

  async getSignedUrlFromParams(empId: string, month: string): Promise<string> {
    throw new Error('Firebase service is disabled - credentials removed');
  }

  async getSignedUrlFromParamsDownload(
    empId: string,
    month: string,
  ): Promise<string> {
    throw new Error('Firebase service is disabled - credentials removed');
  }

  async deleteFile(
    empId: string,
    month: string,
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Firebase service is disabled - credentials removed',
    };
  }
}
// async function main() {
//   const firebaseService = new FirebaseService();
//   firebaseService.onModuleInit();

//   try {
//     const filePath = 'payrolls/E456/E456-02~2025.pdf'; // Adjust path if needed
//     const url = await firebaseService.getSignedUrlFromParams("E456", '02~2025');
//     console.log('Signed URL:', url);
//   } catch (error) {
//     console.error('Test error:', error);
//   }
// }

// main();
