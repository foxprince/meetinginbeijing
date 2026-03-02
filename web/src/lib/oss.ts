import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT_URL;
const region = process.env.S3_REGION_NAME;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
  throw new Error("OSS environment variables are not fully configured.");
}

export const s3Client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
