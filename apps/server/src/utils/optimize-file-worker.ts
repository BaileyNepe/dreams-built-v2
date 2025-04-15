/* eslint-disable no-console */
/**
 * File optimization worker
 *
 * This script is designed to be run as a separate process to handle file optimization
 * without affecting the memory usage of the main application process.
 */

import { optimizeFile } from './file-optimizer';

// Get command line arguments
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node optimize-file-worker.js <key> <contentType>');
  process.exit(1);
}

const [key, contentType] = args;

// Run the optimization
async function runOptimization() {
  try {
    // Run the optimization
    const result = await optimizeFile(key, contentType);

    // Output ONLY the JSON result for the parent process to parse
    // No additional log messages that would break JSON parsing
    process.stdout.write(JSON.stringify(result));

    // Exit successfully
    process.exit(0);
  } catch (error) {
    // For errors, output a JSON error object
    const errorResult = {
      error: true,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    process.stdout.write(JSON.stringify(errorResult));

    // Exit with error
    process.exit(1);
  }
}

// Run the optimization
runOptimization();
