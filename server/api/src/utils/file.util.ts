import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';

export const saveStreamToFile = async (stream: NodeJS.ReadableStream) => {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'telegram');

  await fs.promises.mkdir(uploadsDir, {
    recursive: true,
  });

  const localPath = path.join(uploadsDir, `${randomUUID()}.jpg`);

  await pipeline(stream, fs.createWriteStream(localPath));

  return localPath;
};
