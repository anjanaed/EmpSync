import * as admin from 'firebase-admin';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private bucket: admin.storage.Storage;

  onModuleInit() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: 'empsync-af358',
          clientEmail: 'firebase-adminsdk-fbsvc@empsync-af358.iam.gserviceaccount.com',
          privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCuxoRDlg7YRQAg\nzftsarXVNYtkBi5Jra7bG6r+pE8zticmAh8Mcr8I5n3zof17nqzHbZOPxQj9o5gB\n/qOXS7L5Mvb6Qcvcgt+5QTE6xqe5I5M9Nol7qPYi8JiuqpKv0LSoUZZ3JjO6ucwC\nKGyik+BTBkdy3bYCqIwTzRstYnkWiBqK+afTUp7ndfEg677kOjmUq9o1khCqYjtm\nTmKf5WX2lAXF1nmkRMSsKDAgGfbRO8OtoesGZNTWLQI+XJA5tXrqkhhkhNpNhq0X\n9kuUHNmp8ZMLYYTXM+2dvoAPxwGejxT1wn7x7cnhxlXHCvDckIPKc4jsLcoRGdT6\nKiUVQXgpAgMBAAECggEAEb7P+9VC81g5KbuES0cf6HKX8StT/JDdC7vozhNEg+d7\nHNezC5ZkeVy+vdONG0W6fQKuDHdI4Qjg1JYESeaqmLUBINp4no5utP5up003hxua\ntejBR4wZlqVXWUeyHlYKW7sx8+3N64f1E+SDGDQ7vu5Ip5vlgKpYk6Ob/m0MxpnW\n20vXV0TgKfYvId+H0TDLmB+UDRpO64jbOKorQ8ENhdEkhEZlPN2WbejNVnVIUnlx\niugGF0EupFBBHMjmFkwZhaM8z3/SLjvinzIW9NYBUYs2t2ZWAqslO9ItqZzsW4Yz\nRwulQj2eDEgMYavsS4VMfW1bxWzMsE8/Xlb/d5AukQKBgQDcj01PP9fkG/PF86k9\nw4ywgdMnXlpQNlxYYbeJ68Ya7GfcQyx61PdyIMWEQiH4bTUdJj2HSOpop05bpxRg\nU3rl14KLuzpxkVXwvx6IxQ8thbYbqVCPEhVz+J+jAGwWMyCBb/afXPOg+HiR2ITS\nN/k8DKoEClNXC04A0espNRvEuQKBgQDK2+HztPdR+nmDeTecAatsRUNAMNvoX9Vm\n2Pc944+WkOa2I8U/azy/rSGYbu2SQ4uJyn1/bLvB6gSNvvONhOVqjuN2TLsN2z/d\noJmfSsNHt5XGaRwHc+Nj4qag29Zb/yT3jQ0ncqoiwnjJHzG1MTuTfBn3f/F2BitA\nq4TXvPB28QKBgBQlOqh8alm5e+CeytyLWfRdR04XPiSJcpHYCw2b7XJUGYBy2kM1\n5IwWFjRoXfX0857/+Sq8LDz22x9f+Wp69YS81H2y0jnBTpo4uq8/YI2F4wZPxr3q\npu76zIn05ep5LQTllx8jPFV9nHWl0yvoVOl5NqY70zTmIW/NvK783NZxAoGBAMXG\nwLGREruLP2NOEEh6XD4P/TQdLpmMrYs7JzngngKGvViA4XMmQzEBQ8rRA7BhSC8M\nC3TrdtblKJFlxSCJm/5a1ytkPc6Rnt+eD4h9JIzMUSsDGT+u3dhphlk4W/KPe+Qa\nUePO6E9BWO+FCTqFiHcPPGXQCIMwGoVPdBG99JeRAoGBALAED6zF0L+aeNYydjbs\nxW6cT8W28xCnwV1OtBJdGA22Q/aHunAD1URfFNCt7eHaeLGh1Ja3cloGykH19rNJ\n7nfPlwDh4bBW0M35dusW5sOGUclvNgjlfdGnyYGIvxw2MwmmbgpaBxdXd8p9Y15O\nEoYVkwwXFNHHyqrnXO6ffh82\n-----END PRIVATE KEY-----\n'.replace(/\\n/g, '\n'),
        }),
        storageBucket: 'gs://empsync-af358',
      });
      this.bucket = admin.storage();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase Admin SDK');
    }
  }

  async uploadFile(employeeId: string, filename: string, buffer: Buffer): Promise<string> {
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

  async checkStorageConnection(): Promise<{ connected: boolean; message: string }> {
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

async getSignedUrlFromParamsDownload(empId: string, month: string): Promise<string> {
  try {
    const filename = `${empId}-${month}.pdf`;
    const filePath = `payrolls/${empId}/${filename}`;
    const file = this.bucket.bucket().file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      responseDisposition: `attachment; filename="${filePath.split('/').pop()}"` // Force download with filename
    });
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
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