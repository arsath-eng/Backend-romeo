import { Injectable } from '@nestjs/common';

@Injectable()
export class MockFileInterceptor {
  async intercept(context: any, next: () => Promise<any>): Promise<any> {
    // Replace the following with your desired mock behavior
    context.switchToHttp().getRequest().files = [
      {
        fieldname: 'files',
        originalname: 'test-file1.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('Mock file 1 content'),
      },
      {
        fieldname: 'files',
        originalname: 'test-file2.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('Mock file 2 content'),
      },
      // Add more files if needed
    ];

    return next();
  }
}
