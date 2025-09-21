import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface PhotoInfo {
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function scanPhotosDirectory(photosDir: string): PhotoInfo[] {
  const photos: PhotoInfo[] = [];

  if (!fs.existsSync(photosDir)) {
    console.error(`Photos directory not found: ${photosDir}`);
    return photos;
  }

  const files = fs.readdirSync(photosDir);

  for (const file of files) {
    // Skip hidden files and directories
    if (file.startsWith('.') || file === 'node_modules') {
      continue;
    }

    const filePath = path.join(photosDir, file);
    const stats = fs.statSync(filePath);

    // Only process files (not directories)
    if (stats.isFile()) {
      const ext = path.extname(file).toLowerCase();

      // Only process image files
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'].includes(ext)) {
        photos.push({
          fileName: file,
          originalName: file,
          filePath: `/photos/${file}`, // Relative path from public directory
          fileSize: stats.size,
          mimeType: getMimeType(filePath),
        });
      }
    }
  }

  return photos;
}

async function main() {
  try {
    const photosDir = path.join(process.cwd(), 'photos');
    const photos = scanPhotosDirectory(photosDir);

    console.log(`Found ${photos.length} photos in directory`);

    if (photos.length === 0) {
      console.log('No photos found to seed');
      return;
    }

    // Clear existing photos
    await prisma.photo.deleteMany();
    console.log('Cleared existing photo data');

    // Create photo records
    for (const photoInfo of photos) {
      try {
        const photo = await prisma.photo.create({
          data: {
            fileName: photoInfo.fileName,
            originalName: photoInfo.originalName,
            filePath: photoInfo.filePath,
            fileSize: photoInfo.fileSize,
            mimeType: photoInfo.mimeType,
          },
        });

        console.log(`Created photo record: ${photo.fileName}`);
      } catch (error) {
        console.error(`Error creating photo ${photoInfo.fileName}:`, error);
      }
    }

    console.log('Photo seeding completed successfully');
  } catch (error) {
    console.error('Error during photo seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });