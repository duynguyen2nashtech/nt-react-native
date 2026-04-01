const DEV_URL  = 'http://10.0.2.2:3000';
const PROD_URL = 'https://your-production-api.com';

export const BASE_URL = __DEV__ ? DEV_URL : PROD_URL;