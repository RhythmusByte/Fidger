const bcryptHashPattern = /^\$2[aby]\$\d{2}\$.{53}$/;

export function checkEnvVars() {
  const problems = [];

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    problems.push("MONGODB_URI is missing.");
  } else if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    problems.push("MONGODB_URI doesn't start with mongodb:// or mongodb+srv:// — check for stray quotes or characters.");
  }

  const ownerHash = process.env.OWNER_PASSWORD_HASH;
  if (!ownerHash) {
    problems.push("OWNER_PASSWORD_HASH is missing.");
  } else if (!bcryptHashPattern.test(ownerHash)) {
    problems.push(
      `OWNER_PASSWORD_HASH is set but doesn't look like a valid bcrypt hash (got ${ownerHash.length} characters, expected 60). This usually means the $ characters were shell-expanded when the file was written — edit .env.local directly in a text editor instead.`
    );
  }

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    problems.push("AUTH_SECRET is missing.");
  } else if (authSecret.length < 16) {
    problems.push("AUTH_SECRET is set but shorter than 16 characters.");
  }

  const nextcloudUrl = process.env.NEXTCLOUD_URL;
  if (!nextcloudUrl) {
    problems.push("NEXTCLOUD_URL is missing.");
  } else if (nextcloudUrl.endsWith("/")) {
    problems.push("NEXTCLOUD_URL ends with a trailing slash — remove it.");
  }

  if (!process.env.NEXTCLOUD_USER) {
    problems.push("NEXTCLOUD_USER is missing.");
  }
  if (!process.env.NEXTCLOUD_APP_PASSWORD) {
    problems.push("NEXTCLOUD_APP_PASSWORD is missing.");
  }

  return problems;
}
