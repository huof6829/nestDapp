import { config } from 'dotenv';

// 加载 .env 文件
config();

interface SolanaConfig {
  rpcUrl: string;
  watchedAddress: string;
  message: string;
}

export const envConfig = {
  cache: {
    url: process.env.CACHE_URL,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    dbname: process.env.DATABASE_NAME,
  },
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL ?? throwError('SOLANA_RPC_URL'),
    watchedAddress:
      process.env.SOLANA_WATCHED_ADDRESS ??
      throwError('SOLANA_WATCHED_ADDRESS'),
    message: process.env.SOLANA_MESSAGE ?? throwError('SOLANA_MESSAGE'),
  } as SolanaConfig,
  openai: {
    apiKeys: [
      process.env.OPENAI_API_KEY_1,
      process.env.OPENAI_API_KEY_2,
      process.env.OPENAI_API_KEY_3,
      process.env.OPENAI_API_KEY_4,
      process.env.OPENAI_API_KEY_5,
    ].filter(Boolean) as string[], // 去掉 undefined
  },
  ports: {
    http: parseInt(process.env.HTTP_PORT || '8000', 10),
    websocket: parseInt(process.env.WEBSOCKET_PORT || '9000', 10),
  },
  log: {
    filename: process.env.LOG_FILENAME,
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
  },
  jwt: {
    jwtSecret: process.env.JWT_SECRET,
  },
};

function throwError(name: string): never {
  throw new Error(`${name} is not defined in environment variables`);
}
