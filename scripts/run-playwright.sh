#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "사용법: $0 <대상 URL>" >&2
  exit 1
fi

TARGET_URL="$1"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
RESEARCH_DIR="$PROJECT_ROOT/memory/research"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$RESEARCH_DIR"

OUTPUT_FILE="${SPECODEX_OUTPUT_FILE:-$RESEARCH_DIR/$TIMESTAMP.md}"
SCREENSHOT_FILE="${SPECODEX_SCREENSHOT_FILE:-${OUTPUT_FILE%.md}.png}"
METADATA_FILE="${SPECODEX_METADATA_FILE:-${OUTPUT_FILE%.md}.json}"

export SPECODEX_TARGET_URL="$TARGET_URL"
export SPECODEX_OUTPUT_FILE="$OUTPUT_FILE"
export SPECODEX_SCREENSHOT_FILE="$SCREENSHOT_FILE"
export SPECODEX_METADATA_FILE="$METADATA_FILE"

node <<'NODE'
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const url = process.env.SPECODEX_TARGET_URL;
const outputFile = process.env.SPECODEX_OUTPUT_FILE;
const screenshotFile = process.env.SPECODEX_SCREENSHOT_FILE;
const metadataFile = process.env.SPECODEX_METADATA_FILE;

if (!url) {
  console.error('SPECODEX_TARGET_URL가 설정되지 않았습니다.');
  process.exit(1);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const title = await page.title();
  const headings = await page.$$eval('h1, h2, h3', (nodes) =>
    nodes.map((node) => ({
      tag: node.tagName.toLowerCase(),
      text: node.textContent?.trim() ?? '',
    })),
  );

  const links = await page.$$eval('a[href]', (nodes) =>
    nodes.slice(0, 20).map((node) => ({
      text: node.textContent?.trim() ?? '',
      href: node.getAttribute('href') ?? '',
    })),
  );

  await page.screenshot({ path: screenshotFile, fullPage: true });
  await browser.close();

  const metadata = {
    url,
    capturedAt: new Date().toISOString(),
    title,
    headings,
    links,
    screenshotFile: path.basename(screenshotFile),
  };

  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

  const lines = [
    '# Playwright MCP 연구 로그',
    `- 대상: ${url}`,
    `- 생성 시각: ${metadata.capturedAt}`,
    `- 페이지 제목: ${title}`,
    `- 스크린샷: ${path.basename(screenshotFile)}`,
    `- 메타데이터: ${path.basename(metadataFile)}`,
    '',
    '## 헤딩 요약',
    ...headings.map((item) => `- [${item.tag}] ${item.text}`),
    '',
    '## 주요 링크 (상위 20개)',
    ...links.map((link) => `- ${link.text} -> ${link.href}`),
  ];

  fs.writeFileSync(outputFile, lines.join('\n'));

  console.log(`연구 로그가 저장되었습니다: ${outputFile}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE

unset SPECODEX_TARGET_URL
unset SPECODEX_OUTPUT_FILE
unset SPECODEX_SCREENSHOT_FILE
unset SPECODEX_METADATA_FILE
