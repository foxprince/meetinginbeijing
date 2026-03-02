import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("POSTGRES_URL is not set");
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Truncating blog_posts table...");
    await pool.query("TRUNCATE TABLE blog_posts RESTART IDENTITY;");
    console.log("blog_posts table truncated successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Failed to reset blog_posts table:", error);
  process.exit(1);
});
