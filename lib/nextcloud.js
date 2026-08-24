import { createClient } from "webdav";

const fidgerFolder = "/Fidger";

function getClient() {
  const url = process.env.NEXTCLOUD_URL;
  const username = process.env.NEXTCLOUD_USER;
  const appPassword = process.env.NEXTCLOUD_APP_PASSWORD;
  if (!url || !username || !appPassword) {
    throw new Error("Nextcloud env vars are not fully set (NEXTCLOUD_URL, NEXTCLOUD_USER, NEXTCLOUD_APP_PASSWORD).");
  }
  const webdavBase = `${url.replace(/\/$/, "")}/remote.php/dav/files/${encodeURIComponent(username)}`;
  return createClient(webdavBase, { username, password: appPassword });
}

export async function ensureFidgerFolder() {
  const client = getClient();
  const exists = await client.exists(fidgerFolder);
  if (!exists) {
    await client.createDirectory(fidgerFolder);
  }
}

export async function uploadFileToNextcloud(relativePath, buffer) {
  const client = getClient();
  await ensureFidgerFolder();
  const fullPath = `${fidgerFolder}/${relativePath}`;
  await client.putFileContents(fullPath, buffer, { overwrite: false });
  return fullPath;
}

export async function downloadFileFromNextcloud(fullPath) {
  const client = getClient();
  const buffer = await client.getFileContents(fullPath);
  return buffer;
}

export async function deleteFileFromNextcloud(fullPath) {
  const client = getClient();
  const exists = await client.exists(fullPath);
  if (exists) {
    await client.deleteFile(fullPath);
  }
}

export async function nextcloudHealthCheck() {
  const client = getClient();
  await ensureFidgerFolder();
  const probeFileName = `${fidgerFolder}/.fidgerHealthCheck.txt`;
  const probeContent = `ok-${Date.now()}`;
  await client.putFileContents(probeFileName, probeContent, { overwrite: true });
  const readBack = await client.getFileContents(probeFileName, { format: "text" });
  await client.deleteFile(probeFileName);
  return readBack === probeContent;
}
