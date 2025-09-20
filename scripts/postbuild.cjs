const fs = require('fs');
const path = require('path');

const packageRoot = path.resolve(__dirname, '../packages/random-node');
const distDir = path.join(packageRoot, 'dist');
const iconSrc = path.join(packageRoot, 'src/nodes/Random/random.svg');
const distIconDest = path.join(distDir, 'nodes/Random/random.svg');
const customDir = path.resolve(__dirname, '../n8n/.n8n/custom/random');

if (!fs.existsSync(distDir)) {
  console.error('Build output not found at', distDir);
  process.exit(1);
}

fs.mkdirSync(path.dirname(distIconDest), { recursive: true });
fs.copyFileSync(iconSrc, distIconDest);

fs.mkdirSync(customDir, { recursive: true });

for (const entry of fs.readdirSync(customDir)) {
  fs.rmSync(path.join(customDir, entry), { recursive: true, force: true });
}

fs.copyFileSync(path.join(packageRoot, 'package.json'), path.join(customDir, 'package.json'));
fs.cpSync(distDir, path.join(customDir, 'dist'), { recursive: true });
