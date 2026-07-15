import {z} from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  REDIS_URL: z.string().url().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  PORT: z.preprocess((value) => {
    if (typeof value === "string" && value.trim()) return Number(value);
    return value;
  }, z.number().int().positive().default(3000)),
});

export const appEnv = envSchema.parse(process.env);
