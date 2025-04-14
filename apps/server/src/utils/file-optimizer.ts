import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { generateOptimizedKey, getS3Object, uploadOptimizedFile } from './s3-utils';

// Define optimization result interface
interface OptimizationResult {
  key: string;
  contentType: string;
  size: number;
}

/**
 * Optimize a file based on its content type
 */
export async function optimizeFile(
  key: string,
  contentType: string
): Promise<OptimizationResult> {
  try {
    const fileBuffer = await getS3Object(key);

    // Handle image optimization
    if (contentType.startsWith('image/') && contentType !== 'image/webp') {
      return await optimizeImage(key, fileBuffer, contentType);
    }

    // Handle PDF optimization
    if (contentType === 'application/pdf') {
      return await optimizePdf(key, fileBuffer, contentType);
    }

    // Return original file details if type not supported
    return {
      key,
      contentType,
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('Error optimizing file:', error);
    throw new Error(
      `File optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Optimize an image by converting to WebP format
 */
async function optimizeImage(
  key: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<OptimizationResult> {
  try {
    // Use Sharp directly instead of CLI
    const optimizedBuffer = await sharp(fileBuffer).webp({ quality: 80 }).toBuffer();

    // Generate new key for optimized image
    const newKey = generateOptimizedKey(key, 'webp');

    // Upload the optimized image to S3
    await uploadOptimizedFile(newKey, optimizedBuffer, 'image/webp');

    return {
      key: newKey,
      contentType: 'image/webp',
      size: optimizedBuffer.length
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    // Return original if optimization fails
    return {
      key,
      contentType,
      size: fileBuffer.length
    };
  }
}

/**
 * Optimize a PDF
 * Pass contentType parameter to avoid the reference error
 */
async function optimizePdf(
  key: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<OptimizationResult> {
  try {
    // Generate temp file paths
    const tmpDir = createTempDir();
    const inputPath = join(tmpDir, `input-${Date.now()}.pdf`);
    const outputPath = join(tmpDir, `output-${Date.now()}.pdf`);

    // Write buffer to temp file
    Bun.write(inputPath, fileBuffer);

    // Use Bun to run ghostscript for PDF optimization
    const { success, stdout, stderr } = Bun.spawnSync([
      'gs',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      '-dPDFSETTINGS=/ebook',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile=${outputPath}`,
      inputPath
    ]);

    if (!success) {
      console.error('PDF optimization failed:', stderr.toString());
      throw new Error('PDF optimization failed');
    }

    // Read the optimized PDF
    const optimizedBuffer = await Bun.file(outputPath).arrayBuffer();

    // Only proceed if the optimized file is smaller
    if (optimizedBuffer.byteLength < fileBuffer.length) {
      const newKey = generateOptimizedKey(key, 'pdf');
      await uploadOptimizedFile(newKey, Buffer.from(optimizedBuffer), contentType);

      // Clean up temp files
      try {
        Bun.spawn(['rm', inputPath, outputPath]);
      } catch (e) {
        console.error('Failed to clean up temp files:', e);
      }

      return {
        key: newKey,
        contentType, // Use the passed contentType parameter
        size: optimizedBuffer.byteLength
      };
    }

    // Clean up temp files
    try {
      Bun.spawn(['rm', inputPath, outputPath]);
    } catch (e) {
      console.error('Failed to clean up temp files:', e);
    }

    // Return original if optimization didn't yield savings
    return {
      key,
      contentType, // Use the passed contentType parameter to fix the error
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('PDF optimization error:', error);
    return {
      key,
      contentType, // Use the passed contentType parameter
      size: fileBuffer.length
    };
  }
}

/**
 * Create temp directory for file operations
 */
function createTempDir(): string {
  const tempDir = join(tmpdir(), 'dreams-built-temp');
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
}
