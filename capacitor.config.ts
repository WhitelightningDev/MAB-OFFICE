import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app-base',
  webDir: 'www',
  server: {
    cleartext: true, // Allow cleartext traffic (HTTP)
    allowNavigation: ['http://10.0.0.175:3000', 'http://192.168.5.30:5000'], // Add allowed HTTP URLs
  },
};

export default config;
