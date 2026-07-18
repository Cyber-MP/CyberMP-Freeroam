declare global {
  interface ImportMetaEnv {
    [key: string]: any;
    DEV: boolean;
    PROD: boolean;
    NODE_ENV: 'development' | 'production';
  }

  interface ImportMeta {
    env: ImportMetaEnv;
  }

  namespace NodeJS {
    interface ProcessEnv {
      ADMIN_PASSWORD: string;
    }
  }
}

export {};
