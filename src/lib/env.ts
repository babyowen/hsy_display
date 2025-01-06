export function validateEnv() {
  const requiredEnvVars = [
    'FEISHU_APP_ID',
    'FEISHU_APP_SECRET',
    'FEISHU_APP_TOKEN',
    'TABLE_ID',
    'VIEW_ID'
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
} 