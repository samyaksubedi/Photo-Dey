import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { randomUUID } from 'node:crypto';

const uploadsDirectory = path.resolve(process.cwd(), 'uploads');

export const saveStreamToFile = async (stream: NodeJS.ReadableStream) => {
  const uploadsDir = path.join(uploadsDirectory, 'telegram');

  await fs.promises.mkdir(uploadsDir, {
    recursive: true,
  });

  const localPath = path.join(uploadsDir, `${randomUUID()}.jpg`);

  await pipeline(stream, fs.createWriteStream(localPath));

  return localPath;
};

export const deleteTempFile = async (filePath: string) => {
  const resolvedFilePath = path.resolve(filePath);
  const relativePath = path.relative(uploadsDirectory, resolvedFilePath);

  if (
    relativePath === '' ||
    relativePath === '..' ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error('Refusing to delete a file outside the uploads directory');
  }

  try {
    await fs.promises.unlink(resolvedFilePath);
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return false;
    }

    throw error;
  }
};
