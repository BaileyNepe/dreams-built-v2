/* eslint-disable no-console */
// start-ngrok.js
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const { MUX_WEBHOOK_SECRET, MUX_WEBHOOK_URL } = process.env;

if (!MUX_WEBHOOK_SECRET || !MUX_WEBHOOK_URL) {
  console.error(
    'MUX_WEBHOOK_SECRET or MUX_WEBHOOK_URL is not defined in the environment variables'
  );
  process.exit(1);
}

const command = `ngrok http --url=${MUX_WEBHOOK_URL} 5001 --verify-webhook mux --verify-webhook-secret ${MUX_WEBHOOK_SECRET}`;

// Initialize terminalCommand with a fallback default value
let terminalCommand: string = '';

if (os.platform() === 'win32') {
  // Windows: use 'start' to open a new command prompt window
  terminalCommand = `start cmd.exe /k "${command}"`;
} else if (os.platform() === 'darwin') {
  // macOS: use 'osascript' to open a new Terminal window
  terminalCommand = `osascript -e 'tell application "Terminal" to do script "${command}"'`;
} else if (os.platform() === 'linux') {
  // Linux: use 'x-terminal-emulator' or 'gnome-terminal' to open a new terminal window
  terminalCommand = `x-terminal-emulator -e "${command}"`; // Adjust to your terminal emulator
}

// Ensure terminalCommand has been set
if (!terminalCommand) {
  console.error('Unsupported platform or missing terminal command');
  process.exit(1);
}

// Execute the command in a new terminal
const terminal = spawn(terminalCommand, { shell: true });

// Stream stdout in real-time
terminal.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

// Stream stderr in real-time
terminal.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

// Handle process exit and Ctrl+C
terminal.on('close', (code) => {
  console.log(`ngrok process exited with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('Shutting down ngrok...');
  terminal.kill(); // Ensure ngrok process exits cleanly
  process.exit(); // Exit the Node.js process
});
