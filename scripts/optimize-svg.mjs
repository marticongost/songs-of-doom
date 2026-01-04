import fs from 'node:fs';
import { optimize } from 'svgo';

const file = process.argv[2];
if (!file) process.exit(1);

const original = fs.readFileSync(file, 'utf8');
const result = optimize(original, { multipass: true });

if (result.data !== original) {
	console.log(`Optimizing: ${file}...`);
	fs.writeFileSync(file, result.data, 'utf8');
} else {
	console.log(`${file} is fully optimized.`);
}
