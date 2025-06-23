import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class ImageCompressorService {
  async compressImageBuffer(imageBuffer: Buffer): Promise<Buffer> {
    try {
      const compressedBuffer = await sharp(imageBuffer)
        .jpeg({ quality: 20 })
        .toBuffer();

      return compressedBuffer;
    } catch (error) {
      throw new Error('Image compression failed');
    }
  }
}
