import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.eloxon.app',
  appName: 'AI ToolYes',
  webDir: 'public',
  server: {
    url: 'http://192.168.100.72:4000',
    cleartext: true
  }
};

export default config;
