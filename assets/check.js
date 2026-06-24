const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    if (f === 'node_modules' || f.startsWith('.')) continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(js|jsx|ts|tsx)$/.test(f)) {
      try {
        parser.parse(fs.readFileSync(full, 'utf8'), {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        });
      } catch (e) {
        console.log('ERROR IN FILE:', full);
        console.log('REASON:', e.message);
        console.log('---');
      }
    }
  }
}
walk('.');