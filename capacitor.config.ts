import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ionic-app-base',
  webDir: 'www',
  server: {
    cleartext: true, // Allow cleartext traffic (HTTP)
    allowNavigation: ['http://10.0.0.175:3000', 'http://192.168.5.30:5000'], // Add allowed HTTP URLs
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Duration in milliseconds
      backgroundColor: '#ffffff', // Background color
      androidSplashResourceName: 'splash', // Resource name for the splash screen
      showSpinner: true, // Show spinner or not
      androidSpinnerStyle: 'large', // Spinner style
    },
  },
};

export default config;
