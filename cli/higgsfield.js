#!/usr/bin/env node

/**
 * Higgsfield AI CLI Integration
 * Usage: node cli/higgsfield.js <command> [options]
 *
 * Commands:
 *   image   Generate an image
 *   video   Generate a video
 *   models  List available models
 *
 * Environment:
 *   HF_CREDENTIALS=KEY_ID:KEY_SECRET  (or set HF_API_KEY + HF_API_SECRET)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env from project root ────────────────────────────────────────────
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

// ─── Argument Parser ─────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { _: [] };
  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i += 2;
      } else {
        args[key] = true;
        i++;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const shortcuts = { p: 'prompt', m: 'model', o: 'output', a: 'aspect', d: 'duration', h: 'help' };
      const key = shortcuts[arg[1]] || arg[1];
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        args[key] = next;
        i += 2;
      } else {
        args[key] = true;
        i++;
      }
    } else {
      args._.push(arg);
      i++;
    }
  }
  return args;
}

// ─── Available Models ─────────────────────────────────────────────────────────
const IMAGE_MODELS = {
  'flux-pro':       'flux-pro/kontext/max/text-to-image',
  'flux-flex':      'flux-pro/kontext/flex/text-to-image',
  'gpt-image':      'gpt-image-2/text-to-image',
  'grok-image':     'grok-image/text-to-image',
  'nano-banana':    'nano-banana-pro/text-to-image',
  'seedream':       'seedream-3-0/text-to-image',
  'soul-v2':        'higgsfield-soul-v2/text-to-image',
  'soul-cinematic': 'soul-cinematic/text-to-image',
};

const VIDEO_MODELS = {
  'cinematic':   '/v1/image2video/cinematic-studio-3-0',
  'kling':       '/v1/image2video/kling-v3',
  'veo3':        '/v1/image2video/veo-3',
  'veo3-1':      '/v1/image2video/veo-3-1',
  'seedance':    '/v1/image2video/seedance-2-0',
  'wan':         '/v1/image2video/wan-2-7',
  'marketing':   '/v1/image2video/marketing-studio',
};

// ─── Colors ───────────────────────────────────────────────────────────────────
const noColor = process.argv.includes('--no-color');
const c = {
  reset:  noColor ? '' : '\x1b[0m',
  bold:   noColor ? '' : '\x1b[1m',
  dim:    noColor ? '' : '\x1b[2m',
  cyan:   noColor ? '' : '\x1b[36m',
  green:  noColor ? '' : '\x1b[32m',
  yellow: noColor ? '' : '\x1b[33m',
  red:    noColor ? '' : '\x1b[31m',
  blue:   noColor ? '' : '\x1b[34m',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function log(msg)  { console.log(msg); }
function info(msg) { console.log(`${c.cyan}ℹ${c.reset}  ${msg}`); }
function ok(msg)   { console.log(`${c.green}✓${c.reset}  ${msg}`); }
function warn(msg) { console.log(`${c.yellow}⚠${c.reset}  ${msg}`); }
function err(msg)  { console.error(`${c.red}✗${c.reset}  ${msg}`); }

function ensureOutputDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function downloadFile(url, dest) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Download failed: ${resp.status} ${resp.statusText}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  ensureOutputDir(dest);
  writeFileSync(dest, buf);
}

function defaultOutputPath(ext) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return resolve(__dirname, `../output/${ts}.${ext}`);
}

function getCredentials() {
  const creds = process.env.HF_CREDENTIALS;
  if (creds) return creds;
  const key    = process.env.HF_API_KEY;
  const secret = process.env.HF_API_SECRET;
  if (key && secret) return `${key}:${secret}`;
  return null;
}

// ─── Commands ─────────────────────────────────────────────────────────────────
function cmdHelp() {
  log(`
${c.bold}${c.cyan}Higgsfield AI CLI${c.reset}

${c.bold}الاستخدام:${c.reset}
  node cli/higgsfield.js <command> [options]
  npm run hf -- <command> [options]

${c.bold}الأوامر:${c.reset}
  ${c.green}image${c.reset}   توليد صورة
  ${c.green}video${c.reset}   توليد فيديو
  ${c.green}models${c.reset}  عرض النماذج المتاحة

${c.bold}الخيارات:${c.reset}
  ${c.yellow}--prompt${c.reset},  ${c.yellow}-p${c.reset}  النص التوجيهي (مطلوب)
  ${c.yellow}--model${c.reset},   ${c.yellow}-m${c.reset}  اسم النموذج  (افتراضي: flux-pro / kling)
  ${c.yellow}--output${c.reset},  ${c.yellow}-o${c.reset}  مسار الحفظ   (افتراضي: output/<timestamp>.jpg)
  ${c.yellow}--aspect${c.reset},  ${c.yellow}-a${c.reset}  نسبة الأبعاد  (1:1 | 16:9 | 9:16 | 4:3 | 3:4)
  ${c.yellow}--duration${c.reset},${c.yellow}-d${c.reset}  مدة الفيديو  (5 | 10 ثواني)
  ${c.yellow}--no-color${c.reset}      تعطيل الألوان
  ${c.yellow}--help${c.reset},    ${c.yellow}-h${c.reset}  عرض هذه المساعدة

${c.bold}أمثلة:${c.reset}
  ${c.dim}# توليد صورة${c.reset}
  node cli/higgsfield.js image -p "غروب الشمس على البحر" -m flux-pro

  ${c.dim}# توليد فيديو${c.reset}
  node cli/higgsfield.js video -p "سيارة تسير في صحراء" -m kling -d 5

  ${c.dim}# حفظ في مسار محدد${c.reset}
  node cli/higgsfield.js image -p "قطة" -o ./my-image.jpg

${c.bold}الإعداد:${c.reset}
  انسخ ${c.yellow}.env.example${c.reset} إلى ${c.yellow}.env${c.reset} وضع مفاتيح API الخاصة بك:
  ${c.dim}HF_CREDENTIALS=your-key-id:your-key-secret${c.reset}
`);
}

function cmdModels() {
  log(`\n${c.bold}${c.cyan}نماذج الصور (image models):${c.reset}`);
  for (const [alias, endpoint] of Object.entries(IMAGE_MODELS)) {
    log(`  ${c.green}${alias.padEnd(16)}${c.reset} ${c.dim}${endpoint}${c.reset}`);
  }

  log(`\n${c.bold}${c.cyan}نماذج الفيديو (video models):${c.reset}`);
  for (const [alias, endpoint] of Object.entries(VIDEO_MODELS)) {
    log(`  ${c.green}${alias.padEnd(16)}${c.reset} ${c.dim}${endpoint}${c.reset}`);
  }
  log('');
}

async function cmdImage(args) {
  if (!args.prompt) { err('--prompt مطلوب'); process.exit(1); }

  const credentials = getCredentials();
  if (!credentials) {
    err('لم يتم العثور على مفاتيح API. أضف HF_CREDENTIALS إلى ملف .env');
    info('مثال: HF_CREDENTIALS=your-key-id:your-key-secret');
    process.exit(1);
  }

  const modelAlias = args.model || 'flux-pro';
  const endpoint   = IMAGE_MODELS[modelAlias];
  if (!endpoint) {
    err(`نموذج غير معروف: ${modelAlias}`);
    info(`النماذج المتاحة: ${Object.keys(IMAGE_MODELS).join(', ')}`);
    process.exit(1);
  }

  const outputPath = args.output
    ? resolve(process.cwd(), args.output)
    : defaultOutputPath('jpg');

  info(`النموذج:     ${modelAlias}`);
  info(`النص:        ${args.prompt}`);
  info(`نسبة الأبعاد: ${args.aspect || '1:1'}`);
  info(`الحفظ في:    ${outputPath}`);
  log('');

  const { higgsfield, config } = await import('@higgsfield/client/v2');
  config({ credentials });

  info('جارٍ التوليد...');
  const startTime = Date.now();

  let jobSet;
  try {
    jobSet = await higgsfield.subscribe(endpoint, {
      input: {
        prompt:       args.prompt,
        aspect_ratio: args.aspect || '1:1',
      },
      withPolling: true,
    });
  } catch (e) {
    if (e?.constructor?.name === 'AuthenticationError') {
      err('فشل التحقق من الهوية — تحقق من مفاتيح API');
    } else if (e?.constructor?.name === 'NotEnoughCreditsError') {
      err('رصيد غير كافٍ في حسابك');
    } else {
      err(`خطأ: ${e.message}`);
    }
    process.exit(1);
  }

  if (!jobSet.isCompleted) {
    err(`فشل التوليد — الحالة: ${jobSet.isFailed ? 'فشل' : 'غير معروف'}`);
    process.exit(1);
  }

  const imageUrl = jobSet.jobs[0]?.results?.raw?.url;
  if (!imageUrl) { err('لم يتم الحصول على رابط الصورة'); process.exit(1); }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  info(`اكتمل في ${elapsed} ثانية`);
  info('جارٍ تنزيل الصورة...');

  await downloadFile(imageUrl, outputPath);
  ok(`تم الحفظ: ${outputPath}`);
  ok(`الرابط:   ${imageUrl}`);
}

async function cmdVideo(args) {
  if (!args.prompt) { err('--prompt مطلوب'); process.exit(1); }

  const credentials = getCredentials();
  if (!credentials) {
    err('لم يتم العثور على مفاتيح API. أضف HF_CREDENTIALS إلى ملف .env');
    info('مثال: HF_CREDENTIALS=your-key-id:your-key-secret');
    process.exit(1);
  }

  const modelAlias = args.model || 'kling';
  const endpoint   = VIDEO_MODELS[modelAlias];
  if (!endpoint) {
    err(`نموذج غير معروف: ${modelAlias}`);
    info(`النماذج المتاحة: ${Object.keys(VIDEO_MODELS).join(', ')}`);
    process.exit(1);
  }

  const outputPath = args.output
    ? resolve(process.cwd(), args.output)
    : defaultOutputPath('mp4');

  info(`النموذج:  ${modelAlias}`);
  info(`النص:     ${args.prompt}`);
  info(`المدة:    ${args.duration || 5} ثواني`);
  info(`الحفظ في: ${outputPath}`);
  log('');

  const { higgsfield, config } = await import('@higgsfield/client/v2');
  config({ credentials });

  info('جارٍ التوليد (قد يستغرق دقيقة أو أكثر)...');
  const startTime = Date.now();

  let jobSet;
  try {
    jobSet = await higgsfield.subscribe(endpoint, {
      input: {
        prompt:       args.prompt,
        aspect_ratio: args.aspect   || '16:9',
        duration:     Number(args.duration || 5),
      },
      withPolling: true,
    });
  } catch (e) {
    if (e?.constructor?.name === 'AuthenticationError') {
      err('فشل التحقق من الهوية — تحقق من مفاتيح API');
    } else if (e?.constructor?.name === 'NotEnoughCreditsError') {
      err('رصيد غير كافٍ في حسابك');
    } else {
      err(`خطأ: ${e.message}`);
    }
    process.exit(1);
  }

  if (!jobSet.isCompleted) {
    err(`فشل التوليد — الحالة: ${jobSet.isFailed ? 'فشل' : 'غير معروف'}`);
    process.exit(1);
  }

  const videoUrl = jobSet.jobs[0]?.results?.raw?.url;
  if (!videoUrl) { err('لم يتم الحصول على رابط الفيديو'); process.exit(1); }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  info(`اكتمل في ${elapsed} ثانية`);
  info('جارٍ تنزيل الفيديو...');

  await downloadFile(videoUrl, outputPath);
  ok(`تم الحفظ: ${outputPath}`);
  ok(`الرابط:   ${videoUrl}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args   = parseArgs(process.argv.slice(2));
  const cmd    = args._[0];

  if (!cmd || args.help || cmd === 'help') { cmdHelp(); return; }

  switch (cmd) {
    case 'image':  await cmdImage(args);  break;
    case 'video':  await cmdVideo(args);  break;
    case 'models': cmdModels();           break;
    default:
      err(`أمر غير معروف: ${cmd}`);
      info('استخدم --help لرؤية الأوامر المتاحة');
      process.exit(1);
  }
}

main().catch(e => {
  err(e.message || String(e));
  process.exit(1);
});
