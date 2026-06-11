import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eloxon.app',
  appName: 'AI ToolYes',
  webDir: 'public',
  server: {
    url: 'https://aitoolyes.com',
    cleartext: true
  }
};

export default config;
