import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

// Distribution copies only: the imported WebM evidence remains immutable.
export function playbackCopy(source, destination, cacheDirectory) {
  const key = createHash('sha256').update('h264-main-yuv420p-crf22-v1\0').update(fs.readFileSync(source)).digest('hex');
  fs.mkdirSync(cacheDirectory, { recursive: true });
  const cached = path.join(cacheDirectory, `${key}.mp4`);
  if (!fs.existsSync(cached)) {
    const pending = path.join(cacheDirectory, `${key}-${process.pid}.mp4`);
    try {
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source,
        '-an', '-c:v', 'libx264', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
        '-preset', 'fast', '-crf', '22', '-movflags', '+faststart', pending], { stdio: 'pipe' });
      fs.renameSync(pending, cached);
    } catch (error) {
      fs.rmSync(pending, { force: true });
      throw new Error(`Cannot prepare recording playback. Install ffmpeg with libx264 support. ${error.message}`);
    }
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(cached, destination);
}
