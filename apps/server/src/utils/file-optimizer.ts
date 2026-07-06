/* eslint-disable no-console */
import { existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { createSemaphore } from './concurrency';
import { generateOptimizedKey, getS3Object, uploadOptimizedFile } from './s3-utils';

// Define optimization result interface
interface OptimizationResult {
  key: string;
  contentType: string;
  size: number;
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

/**
 * Optimize an image by converting to WebP format
 */
async function optimizeImage(
  key: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<OptimizationResult> {
  let optimizedBuffer: Buffer | null = null;
  try {
    // Use Sharp with settings optimized for larger files
    const sharpInstance = sharp(fileBuffer, {
      limitInputPixels: false // Allow processing of large images
    });

    // Convert to WebP with quality settings
    optimizedBuffer = await sharpInstance
      .webp({
        quality: 80,
        effort: 4 // Higher compression effort (0-6)
      })
      .toBuffer();

    // Generate new key for optimized image
    const newKey = generateOptimizedKey(key, 'webp');

    // Upload the optimized image to S3
    await uploadOptimizedFile(newKey, optimizedBuffer, 'image/webp');

    const result = {
      key: newKey,
      contentType: 'image/webp',
      size: optimizedBuffer.length
    };

    // Clear the buffer reference to help garbage collection
    optimizedBuffer = null;
    return result;
  } catch (error) {
    console.error('Image optimization error:', error);
    // Clear the buffer reference to help garbage collection
    optimizedBuffer = null;
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
  let optimizedBuffer: ArrayBuffer | null = null;
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    // Generate temp file paths
    const tmpDir = createTempDir();
    inputPath = join(tmpDir, `input-${Date.now()}.pdf`);
    outputPath = join(tmpDir, `output-${Date.now()}.pdf`);

    // Write buffer to temp file
    await Bun.write(inputPath, fileBuffer);

    // Use Bun to run ghostscript for PDF optimization with increased memory limits.
    // Use the async Bun.spawn (not spawnSync) so the event loop stays free while
    // ghostscript runs on another core — spawnSync would freeze the whole server
    // for the duration of a large PDF's compression.
    const proc = Bun.spawn(
      [
        'gs',
        '-sDEVICE=pdfwrite',
        '-dCompatibilityLevel=1.4',
        '-dPDFSETTINGS=/ebook',
        '-dNOPAUSE',
        '-dQUIET',
        '-dBATCH',
        '-dMemoryLimit=1000000000', // Increased to 1GB
        '-dBufferSize=100000000', // Increased to 100MB
        `-sOutputFile=${outputPath}`,
        inputPath
      ],
      { stdout: 'ignore', stderr: 'pipe' }
    );

    // Drain stderr while awaiting exit — reading the pipe concurrently prevents a
    // deadlock if ghostscript writes enough to stderr to fill the pipe buffer.
    const [stderr, exitCode] = await Promise.all([
      new Response(proc.stderr).text(),
      proc.exited
    ]);

    if (exitCode !== 0) {
      console.error('PDF optimization failed:', stderr);
      throw new Error('PDF optimization failed');
    }

    // Read the optimized PDF
    optimizedBuffer = await Bun.file(outputPath).arrayBuffer();

    // Only proceed if the optimized file is smaller
    if (optimizedBuffer.byteLength < fileBuffer.length) {
      const newKey = generateOptimizedKey(key, 'pdf');
      const buffer = Buffer.from(optimizedBuffer);
      await uploadOptimizedFile(newKey, buffer, contentType);

      // Clear the buffer reference to help garbage collection
      optimizedBuffer = null;

      // Clean up temp files
      try {
        if (inputPath) Bun.spawn(['rm', inputPath]);
        if (outputPath) Bun.spawn(['rm', outputPath]);
      } catch (e) {
        console.error('Failed to clean up temp files:', e);
      }

      return {
        key: newKey,
        contentType, // Use the passed contentType parameter
        size: buffer.length
      };
    }

    // Clean up temp files
    try {
      if (inputPath) Bun.spawn(['rm', inputPath]);
      if (outputPath) Bun.spawn(['rm', outputPath]);
    } catch (e) {
      console.error('Failed to clean up temp files:', e);
    }

    // Clear the buffer reference to help garbage collection
    optimizedBuffer = null;

    // Return original if optimization didn't yield savings
    return {
      key,
      contentType, // Use the passed contentType parameter to fix the error
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('PDF optimization error:', error);
    // Clean up temp files
    try {
      if (inputPath) Bun.spawn(['rm', inputPath]);
      if (outputPath) Bun.spawn(['rm', outputPath]);
    } catch (e) {
      console.error('Failed to clean up temp files:', e);
    }

    // Clear the buffer reference to help garbage collection
    optimizedBuffer = null;

    return {
      key,
      contentType, // Use the passed contentType parameter
      size: fileBuffer.length
    };
  }
}

/**
 * Optimize a file based on its content type.
 * Wrapped by `optimizeFile` (below) so concurrency stays bounded via the semaphore.
 */
async function runOptimization(
  key: string,
  contentType: string
): Promise<OptimizationResult> {
  let fileBuffer: Buffer | null = null;
  try {
    // Get the file from S3
    fileBuffer = await getS3Object(key);
    const bufferSize = fileBuffer.length;

    // Handle image optimization
    if (contentType.startsWith('image/') && contentType !== 'image/webp') {
      const result = await optimizeImage(key, fileBuffer, contentType);
      // Clear the buffer reference to help garbage collection
      fileBuffer = null;
      return result;
    }

    // Handle PDF optimization
    if (contentType === 'application/pdf') {
      const result = await optimizePdf(key, fileBuffer, contentType);
      // Clear the buffer reference to help garbage collection
      fileBuffer = null;
      return result;
    }

    // Return original file details if type not supported
    const result = {
      key,
      contentType,
      size: bufferSize
    };
    // Clear the buffer reference to help garbage collection
    fileBuffer = null;
    return result;
  } catch (error) {
    console.error('Error optimizing file:', error);
    // Clear the buffer reference to help garbage collection
    fileBuffer = null;
    throw new Error(
      `File optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Cap how many optimizations run at once so a burst of large uploads can't spawn
// many memory-heavy ghostscript/sharp jobs in parallel and OOM the container.
const MAX_CONCURRENT_OPTIMIZATIONS = 2;
const limitOptimization = createSemaphore(MAX_CONCURRENT_OPTIMIZATIONS);

/**
 * Optimize a file based on its content type.
 * Runs through a global semaphore so concurrency stays bounded across requests.
 */
export async function optimizeFile(
  key: string,
  contentType: string
): Promise<OptimizationResult> {
  return limitOptimization(() => runOptimization(key, contentType));
}
