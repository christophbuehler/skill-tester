import fs from 'node:fs';
import path from 'node:path';
import { files } from './runner-lib.mjs';
export function auditColorSource(source, extension) {
  let text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  if (extension === '.css') text = text.replace(/--[\w-]+\s*:[^;{}]+(?:;|(?=}))/g, '');
  else text = text.replace(/\b(?:href|xlinkHref|id)\s*=\s*(?:["'][^"']*["']|\{["'][^"']*["']\})/g, '');
  // A color function that sources its channels from a variable remains semantic.
  text = text.replace(/\b(?:rgba?|hsla?|oklch|oklab|lch|lab|hwb)\s*\(\s*var\([^)]*\)(?:\s*[,/]\s*[\d.%]+)?\s*\)/gi, 'var(--semantic-color)');
  const findings = [];
  if (/(?:#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lch|lab|hwb)\s*\()/i.test(text)) findings.push('Literal color outside centralized CSS custom-property declarations.');
  if (/\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|accent|caret)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/.test(text)) findings.push('Palette utility used instead of a semantic color utility.');
  if (/(?:color|background(?:-color)?|backgroundColor|fill|stroke|border(?:-color)?|borderColor)\s*(?:[:=])\s*(?:["']|\{["'])?(?:white|black|red|blue|green|gray|grey)\b|\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow)-\[(?:white|black|red|blue|green|gray|grey)\]/i.test(text)) findings.push('Named literal color outside the token declarations.');
  return findings;
}
export function auditPresentation(work) {
  return files(path.join(work, 'src')).filter(f => /\.(?:css|tsx?|jsx?)$/.test(f)).flatMap(file =>
    auditColorSource(fs.readFileSync(file,'utf8'), path.extname(file)).map(message => `${path.relative(work,file)}: ${message}`));
}
