import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.moneywise.app',
  appName: 'MoneyWise',
  webDir: 'dist/moneywise-frontend/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;
