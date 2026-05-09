function required(name: string, value?: string) {
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export const env = {
  mongoUri: required("MONGODB_URI", process.env.MONGODB_URI),
  dbName: required("DB_NAME", process.env.DB_NAME),
  groqApiKey: required("GROQ_API_KEY", process.env.GROQ_API_KEY),
};
