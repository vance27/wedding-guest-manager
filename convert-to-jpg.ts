#!/usr/bin/env npx tsx

import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ConversionResult {
  original: string;
  converted: string;
  success: boolean;
  error?: string;
}

async function convertToJpg(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Use ImageMagick to convert files to JPG
    await execAsync(`magick "${inputPath}" "${outputPath}"`);
  } catch (error) {
    throw new Error(`Failed to convert ${inputPath}: ${error}`);
  }
}

async function processPhotosDirectory(photosDir: string = 'photos'): Promise<ConversionResult[]> {
  const results: ConversionResult[] = [];

  try {
    const files = await fs.readdir(photosDir);
    console.log(`Found ${files.length} files in ${photosDir} directory`);

    for (const file of files) {
      const filePath = join(photosDir, file);
      const ext = extname(file).toLowerCase();
      const baseName = basename(file, extname(file));

      // Skip files that are already JPG/JPEG or system files
      if (ext === '.jpg' || ext === '.jpeg' || file.startsWith('.')) {
        console.log(`Skipping ${file} - already JPG/JPEG or system file`);
        continue;
      }

      // Check if it's a file we can convert
      if (['.pdf', '.png', '.heic', '.webp', '.bmp', '.tiff', '.tif'].includes(ext)) {
        const outputPath = join(photosDir, `${baseName}.jpg`);

        try {
          console.log(`Converting ${file} to JPG...`);

          // Special handling for PDF files - convert first page only
          if (ext === '.pdf') {
            await execAsync(`magick "${filePath}[0]" "${outputPath}"`);
          } else {
            await convertToJpg(filePath, outputPath);
          }

          console.log(`✅ Successfully converted ${file} to ${baseName}.jpg`);
          results.push({
            original: file,
            converted: `${baseName}.jpg`,
            success: true
          });

          // Optionally remove the original file (commented out for safety)
          // await fs.unlink(filePath);
          // console.log(`Removed original file: ${file}`);

        } catch (error) {
          console.error(`❌ Failed to convert ${file}: ${error}`);
          results.push({
            original: file,
            converted: `${baseName}.jpg`,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      } else {
        console.log(`Skipping ${file} - unsupported format or already processed`);
      }
    }

  } catch (error) {
    console.error(`Error reading directory ${photosDir}:`, error);
    throw error;
  }

  return results;
}

async function checkImageMagick(): Promise<boolean> {
  try {
    await execAsync('magick -version');
    return true;
  } catch (error) {
    return false;
  }
}

async function main(): Promise<void> {
  console.log('🖼️  Photo Format Converter');
  console.log('Converting all non-JPG files to JPG format...\n');

  // Check if ImageMagick is installed
  const hasImageMagick = await checkImageMagick();
  if (!hasImageMagick) {
    console.error('❌ ImageMagick is not installed or not found in PATH');
    console.error('Please install ImageMagick:');
    console.error('  macOS: brew install imagemagick');
    console.error('  Ubuntu: sudo apt-get install imagemagick');
    console.error('  Windows: Download from https://imagemagick.org/script/download.php');
    process.exit(1);
  }

  try {
    const results = await processPhotosDirectory();

    console.log('\n📊 Conversion Summary:');
    console.log(`Total files processed: ${results.length}`);
    console.log(`Successful conversions: ${results.filter(r => r.success).length}`);
    console.log(`Failed conversions: ${results.filter(r => !r.success).length}`);

    if (results.filter(r => !r.success).length > 0) {
      console.log('\n❌ Failed conversions:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`  ${result.original}: ${result.error}`);
      });
    }

    console.log('\n✅ Conversion process completed!');
    console.log('Note: Original files have been preserved. Delete them manually if desired.');

  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}