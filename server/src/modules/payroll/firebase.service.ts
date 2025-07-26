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
      admin.initializeApp({
        credential: admin.credential.cert(
          './src/modules/payroll/firebase-credentials.json',
        ),
        //Download the firebase-credentials.json file from cloud console
        storageBucket: 'gs://empsync-af358',
      });
      this.bucket = admin.storage();
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
    try {
      const filePath = `payrolls/${employeeId}/${filename}`;
      const file = this.bucket.bucket().file(filePath);
      await file.save(buffer, {
        contentType: 'application/pdf',
        metadata: {
          firebaseStorageDownloadTokens: employeeId,
        },
      });
      return filePath;
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      throw new Error('Failed to upload file to Firebase Storage');
    }
  }

  async checkStorageConnection(): Promise<{
    connected: boolean;
    message: string;
  }> {
    try {
      const bucket = this.bucket.bucket();
      const [metadata] = await bucket.getMetadata();
      return {
        connected: true,
        message: `Successfully connected to Firebase Storage bucket: ${metadata.name}`,
      };
    } catch (error) {
      return {
        connected: false,
        message: `Failed to connect to Firebase Storage: ${error.message}`,
      };
    }
  }

  async getSignedUrlFromParams(empId: string, month: string): Promise<string> {
    try {
      const filename = `${empId}-${month}.pdf`;
      const filePath = `payrolls/${empId}/${filename}`;
      const file = this.bucket.bucket().file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      });
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async getSignedUrlFromParamsDownload(
    empId: string,
    month: string,
  ): Promise<string> {
    try {
      const filename = `${empId}-${month}.pdf`;
      const filePath = `payrolls/${empId}/${filename}`;
      const file = this.bucket.bucket().file(filePath);
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
        responseDisposition: `attachment; filename="${filePath.split('/').pop()}"`, // Force download with filename
      });
      return url;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async getFileBuffer(
    empId: string,
    month: string,
  ): Promise<Buffer> {
    try {
      const filename = `${empId}-${month}.pdf`;
      const filePath = `payrolls/${empId}/${filename}`;
      const file = this.bucket.bucket().file(filePath);
      
      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error(`File ${filePath} does not exist in Firebase Storage`);
      }
      
      // Download file as buffer
      const [fileBuffer] = await file.download();
      return fileBuffer;
    } catch (error) {
      console.error('Error downloading file buffer:', error);
      throw new Error('Failed to download file from Firebase Storage');
    }
  }

  async deleteFile(
    empId: string,
    month: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const filename = `${empId}-${month}.pdf`;
      const filePath = `payrolls/${empId}/${filename}`;
      const file = this.bucket.bucket().file(filePath);

      // Check if file exists before deleting
      const [exists] = await file.exists();
      if (!exists) {
        return {
          success: false,
          message: `File ${filePath} does not exist in Firebase Storage`,
        };
      }

      // Delete the file
      await file.delete();
      return {
        success: true,
        message: `Successfully deleted file: ${filePath}`,
      };
    } catch (error) {
      console.error('Error deleting file from Firebase:', error);
      return {
        success: false,
        message: `Failed to delete file from Firebase Storage: ${error.message}`,
      };
    }
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