import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eloxon.app',
  appName: 'AI ToolYes',
  webDir: 'public',
  server: {
    // For local testing on your phone, use your PC's IP address.
    // For production, change this to your live domain: 'https://aitoolyes.com'
    url: 'http://192.168.100.72:4000',
    cleartext: true
  }
};

export default config;
