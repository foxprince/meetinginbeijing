import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT_URL || "https://dummy.example.com";
const region = process.env.S3_REGION_NAME || "us-east-1";
const accessKeyId = process.env.S3_ACCESS_KEY_ID || "dummy-key";
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "dummy-secret";

export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export function validateOSSConfig(): void {
  if (!process.env.S3_ENDPOINT_URL || !process.env.S3_REGION_NAME || 
      !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
    throw new Error("OSS environment variables are not fully configured.");
  }
}
