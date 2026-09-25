/*
 * The one encode pipeline for every video the site plays (E3.2): the homepage
 * hero loop and the per-horse sales and full-round clips. Encodes, cuts the
 * poster, reads the duration, uploads to R2 and prints the JSON to paste.
 *
 *   npm run video -- <input> hero                [--poster 0] [--no-upload]
 *   npm run video -- <input> sales|round <slug>  [--poster 1] [--no-upload]
 *
 * Video never goes through the admin panel (#20): iPhone footage is often HEVC,
 * which Chrome and Firefox will not play, and a transcode does not belong in a
 * browser. Needs ffmpeg, ffprobe and `npx wrangler@4 login` once (README).
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { media } from '../src/media.ts';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { poster: { type: 'string' }, 'no-upload': { type: 'boolean' } },
});
const [input, kind, slug] = positionals;
const hero = kind === 'hero';
if (
  !input ||
  !['hero', 'sales', 'round'].includes(kind) ||
  (!hero && !/^[a-z0-9-]+$/.test(slug ?? ''))
) {
  console.error(
    'Usage: npm run video -- <input> hero | <input> sales|round <slug>  [--poster <s>] [--no-upload]',
  );
  process.exit(1);
}

const run = (cmd, args) =>
  execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const probe = (file, entries) =>
  run('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    entries,
    '-of',
    'csv=p=0',
    file,
  ]).trim();

/*
 * iPhones record HLG HDR by default. Squashed to 8-bit SDR without tone mapping
 * it comes out washed out, so refuse rather than publish that.
 * ponytail: refuses HDR — Homebrew's ffmpeg has no zscale. Add the
 * zscale -> tonemap -> bt709 chain when an ffmpeg with libzimg is the norm.
 */
if (['arib-std-b67', 'smpte2084'].includes(probe(input, 'stream=color_transfer'))) {
  console.error(
    'HDR footage. Re-export it as SDR (Photos › Share › Options › "Most Compatible"),\n' +
      'or turn off Settings › Camera › Record Video › HDR Video before filming.',
  );
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'video-'));
// Short side capped at 1080, so portrait footage scales too; -2 keeps it even.
const scale = "scale='if(gt(iw,ih),-2,min(1080,iw))':'if(gt(iw,ih),min(1080,ih),-2)'";
const ffmpeg = (args, out) => {
  run('ffmpeg', ['-v', 'error', '-y', '-i', input, '-vf', scale, ...args, join(dir, out)]);
  return join(dir, out);
};

/*
 * Without +faststart the moov atom lands at the end of the file and the browser
 * downloads the whole clip before the first frame — which looks exactly like a
 * broken player.
 */
const h264 = [
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-pix_fmt',
  'yuv420p',
  '-profile:v',
  'high',
  '-movflags',
  '+faststart',
];
const files = hero
  ? {
      // A 5 Mbps ceiling keeps an 8 s loop inside the 3-6 MB hero budget, noisy footage too.
      mp4: ffmpeg([...h264, '-crf', '21', '-maxrate', '5M', '-bufsize', '10M', '-an'], 'hero.mp4'),
      // A second encode of an 8-second loop is worth the saving; the clips' is not.
      webm: ffmpeg(
        [
          '-c:v',
          'libvpx-vp9',
          '-crf',
          '32',
          '-b:v',
          '5M',
          '-row-mt',
          '1',
          '-pix_fmt',
          'yuv420p',
          '-an',
          '-cues_to_front',
          '1',
        ],
        'hero.webm',
      ),
    }
  : {
      /*
       * ponytail: one 1080p rendition, no adaptive bitrate without HLS. Behind the
       * facade (#28) preload="none" means the download starts on a deliberate
       * click. Cloudflare Stream is the upgrade if that ever bites.
       */
      mp4: ffmpeg(
        [...h264, '-crf', '23', '-c:a', 'aac', '-b:a', '128k', '-ac', '2'],
        `${kind}.mp4`,
      ),
    };
files.jpg = ffmpeg(
  ['-ss', values.poster ?? (hero ? '0' : '1'), '-frames:v', '1', '-q:v', '4'],
  'poster.jpg',
);
const durationS = Math.max(1, Math.round(Number(probe(files.mp4, 'format=duration'))));

// Content-addressed, so a key is never overwritten and the immutable Cache-Control holds.
const prefix = hero ? 'home/hero' : `horses/${slug}/videos/${kind}`;
const keys = Object.fromEntries(
  Object.entries(files).map(([ext, file]) => {
    const sha8 = createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 8);
    return [ext, `${prefix}-${sha8}.${ext}`];
  }),
);

const types = { mp4: 'video/mp4', webm: 'video/webm', jpg: 'image/jpeg' };
for (const [ext, file] of Object.entries(files)) {
  const mb = statSync(file).size / 1e6;
  console.error(`${keys[ext]}  ${mb.toFixed(2)} MB  ${file}`);
  if (hero && ext === 'mp4' && mb > 6) console.error('  over the 6 MB hero budget — trim the clip');
  if (values['no-upload']) continue;
  // prettier-ignore
  execFileSync('npx', ['wrangler@4', 'r2', 'object', 'put', `${media.bucket}/${keys[ext]}`, '--file', file,
    '--remote', '--cache-control', media.cacheControl, '--content-type', types[ext]], { stdio: 'inherit' });
}

if (hero) {
  console.log(
    JSON.stringify(
      { mp4Key: keys.mp4, webmKey: keys.webm, posterKey: keys.jpg, durationS },
      null,
      2,
    ),
  );
} else {
  console.error(`Add this to ${slug}'s Videos in the admin, and fill in the transcript:`);
  const video = {
    key: keys.mp4,
    kind,
    posterKey: keys.jpg,
    durationS,
    transcript: { pl: '', en: '' },
  };
  console.log(JSON.stringify(video, null, 2));
}
