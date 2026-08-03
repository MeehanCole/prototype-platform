#!/usr/bin/env node
/**
 * figma-to-platform.mjs
 *
 * 把 01-raw/ 里的 Figma/AI 原始导出代码，按 style-mapping.json
 * 做批量静态转化，输出到 02-adapters/ 里做一个可预览的薄适配器。
 * 目前是骨架（留待后续填充具体转化步骤），每一步都做最小变更，
 * 遵循"先在 02-adapters 能看效果 → 再逐步接入 pages/"的流程。
 *
 * 用法：
 *   cd prototype-platform
 *   node src/pages-imports/03-converters/figma-to-platform.mjs <raw子目录名>
 *
 * 示例：
 *   node src/pages-imports/03-converters/figma-to-platform.mjs figma-cloudapi-20260801
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..'); // prototype-platform/
const RAW_DIR = join(ROOT, 'src', 'pages-imports', '01-raw');
const ADAPTER_DIR = join(ROOT, 'src', 'pages-imports', '02-adapters');
const MAPPING_PATH = join(__dirname, 'style-mapping.json');

function main() {
  const subDir = process.argv[2];
  if (!subDir) {
    console.error('[figma-to-platform] 请传入 01-raw/ 下的子目录名。');
    console.error('  例: node figma-to-platform.mjs figma-cloudapi-20260801');
    process.exit(1);
  }
  const src = join(RAW_DIR, subDir);
  if (!existsSync(src)) {
    console.error(`[figma-to-platform] 找不到目录: ${src}`);
    process.exit(1);
  }
  const mapping = JSON.parse(readFileSync(MAPPING_PATH, 'utf8'));
  const dest = join(ADAPTER_DIR, subDir);
  mkdirSync(dest, { recursive: true });

  console.log(`[figma-to-platform] 转化 ${subDir} → 02-adapters/`);
  console.log(`  - 颜色映射数: ${Object.keys(mapping.colors.bg).length + Object.keys(mapping.colors.text).length}`);
  console.log(`  - 组件映射数: ${Object.keys(mapping.components).length - 1}`);

  // 目前只做"原样 copy + 生成 adapter shim"，具体颜色/组件批量替换逻辑留到下次迭代。
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const from = join(src, entry.name);
    const to = join(dest, entry.name);
    if (entry.isDirectory()) {
      mkdirSync(to, { recursive: true });
      for (const f of readdirSync(from)) copyFileSync(join(from, f), join(to, f));
    } else {
      copyFileSync(from, to);
    }
  }

  // 生成 meta.json 适配器说明，方便后续接入 pageRegistry
  writeFileSync(
    join(dest, 'meta.json'),
    JSON.stringify(
      {
        title: subDir,
        module: 'pages-imports',
        source: '01-raw/' + subDir,
        convertedBy: 'figma-to-platform.mjs (skeleton, static copy)',
        convertedAt: new Date().toISOString(),
        status: 'adapter-preview-only',
        note: '当前是 raw 的静态副本，尚未对齐 Tailwind token / Shadcn 组件，仅用于预览。'
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  console.log(`[figma-to-platform] ✅ 完成，输出目录: ${dest}`);
}

main();
