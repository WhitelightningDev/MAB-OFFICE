import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter', // Your app's unique identifier
  appName: 'ionic-app-base', // Your app's name
  webDir: 'www', // Directory for web assets
  server: {
    cleartext: true, // Allow cleartext traffic (HTTP)
    allowNavigation: [
      'http://10.0.0.175:3000', // Local development server
      'http://192.168.5.30:5000', // Another local server
      'https://hades.mabbureau.com', // Allowed HTTPS site
    ], // Allowed HTTP URLs
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'Allow this app to access your camera', // Camera permission prompt
      },
    },
  },
};

export default config;
