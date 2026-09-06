import fs from 'node:fs';
import path from 'node:path';

function walkDir(dir, ext) {
  const results = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...walkDir(fullPath, ext));
    } else if (item.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function unwrapLayers(css) {
  let changed = true;
  let count = 0;
  while (changed) {
    changed = false;
    const regex = /@layer\s+[\w-]*\s*\{/g;
    let match;
    while ((match = regex.exec(css)) !== null) {
      const startIdx = match.index;
      const openBraceIdx = match.index + match[0].length - 1;
      let depth = 1;
      let i = openBraceIdx + 1;
      while (i < css.length && depth > 0) {
        if (css[i] === '{') depth++;
        else if (css[i] === '}') depth--;
        i++;
      }
      if (depth === 0) {
        const inner = css.substring(openBraceIdx + 1, i - 1);
        const before = css.substring(0, startIdx);
        const after = css.substring(i);
        css = before + inner + after;
        count++;
        changed = true;
        regex.lastIndex = 0;
        break;
      }
    }
  }
  return { css, count };
}

function removeUnsupportedAtRules(css) {
  let count = 0;
  css = css.replace(/@property\s+[^{]+\{[^}]*\}/g, () => { count++; return ''; });
  css = css.replace(/@container\s+\([^)]+\)\s*\{/g, () => { count++; return ''; });
  return { css, count };
}

const distDir = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distDir)) {
  console.error('[fix-css-compat] dist directory not found!');
  process.exit(1);
}

const cssFiles = walkDir(distDir, '.css');
console.log(`[fix-css-compat] Found ${cssFiles.length} CSS files`);

let totalLayers = 0;
let totalOther = 0;

cssFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  const layerResult = unwrapLayers(content);
  if (layerResult.count > 0) {
    content = layerResult.css;
    totalLayers += layerResult.count;
    modified = true;
  }

  const cssResult = removeUnsupportedAtRules(content);
  if (cssResult.count > 0) {
    content = cssResult.css;
    totalOther += cssResult.count;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Fixed: ${path.relative(distDir, filePath)} (${layerResult.count} layers, ${cssResult.count} other)`);
  }
});

const htmlFiles = walkDir(distDir, '.html');
console.log(`[fix-css-compat] Found ${htmlFiles.length} HTML files (checking inline CSS)`);

htmlFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  content = content.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (match, cssContent) => {
    let css = cssContent;
    const layerResult = unwrapLayers(css);
    if (layerResult.count > 0) {
      css = layerResult.css;
      totalLayers += layerResult.count;
      modified = true;
    }
    const cssResult = removeUnsupportedAtRules(css);
    if (cssResult.count > 0) {
      css = cssResult.css;
      totalOther += cssResult.count;
      modified = true;
    }
    return `<style>${css}</style>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Fixed inline CSS: ${path.relative(distDir, filePath)}`);
  }
});

console.log(`\n[fix-css-compat] Done: ${totalLayers} @layer rules unwrapped, ${totalOther} unsupported rules removed`);
