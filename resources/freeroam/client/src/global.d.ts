declare global {
  interface ImportMetaEnv {
    DEV: boolean;
    PROD: boolean;
    NODE_ENV: 'development' | 'production';
  }

  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

export {};
