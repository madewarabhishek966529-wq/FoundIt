import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const processAndUploadImage = async (fileBuffer, originalName = 'item.jpg') => {
  // 1. Resize and strip metadata (EXIF/GPS removal) using Sharp
  const processedBuffer = await sharp(fileBuffer)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  // 2. Upload to Cloudinary if credentials exist
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'foundit/items',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            buffer: processedBuffer
          });
        }
      );
      uploadStream.end(processedBuffer);
    });
  }

  // Fallback: Save locally
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const filename = `${Date.now()}-${randomSuffix}.jpg`;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, processedBuffer);

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
    buffer: processedBuffer
  };
};

export const processAndUploadMultiple = async (files = []) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) => processAndUploadImage(file.buffer, file.originalname));
  return Promise.all(uploadPromises);
};
