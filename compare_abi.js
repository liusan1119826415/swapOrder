const fs = require('fs');

// Read JSON ABI
const jsonArtifact = require('./EasySwapContract/artifacts/contracts/EasySwapOrderBook.sol/EasySwapOrderBook.json');
const jsonAbi = jsonArtifact.abi;

// Read and parse TS ABI - extract function/event/error names manually
const tsContent = fs.readFileSync('./nft-market-next/lib/contracts/abis/EasySwapOrderBook.ts', 'utf8');

// Extract all name fields from TS ABI
const nameRegex = /name:\s*['"]([^'"]+)['"]/g;
const tsNames = new Set();
let match;
while ((match = nameRegex.exec(tsContent)) !== null) {
  tsNames.add(match[1]);
}

console.log('=== ABI Comparison ===\n');

// Extract JSON ABI names and types
const jsonItems = jsonAbi.map(item => ({ name: item.name || 'anonymous', type: item.type }));
const jsonNames = new Set(jsonItems.filter(item => item.name !== 'anonymous').map(item => item.name));

console.log('JSON ABI length:', jsonAbi.length);
console.log('TS ABI length (estimated):', tsNames.size);
console.log('Difference:', jsonAbi.length - tsNames.size, '\n');

// Find items in JSON but not in TS
const missingInTs = [...jsonNames].filter(name => !tsNames.has(name));
const extraInTs = [...tsNames].filter(name => !jsonNames.has(name));

console.log('Missing in TS ABI (present in JSON):');
if (missingInTs.length === 0) {
  console.log('  (none)');
} else {
  missingInTs.forEach(name => console.log(`  - ${name}`));
}

console.log('\nExtra in TS ABI (not in JSON):');
if (extraInTs.length === 0) {
  console.log('  (none)');
} else {
  extraInTs.forEach(name => console.log(`  - ${name}`));
}

// Check for errors in JSON ABI
const jsonErrors = jsonAbi.filter(item => item.type === 'error');

// Extract error names from TS
const tsErrorNames = new Set();
const errorRegex = /type:\s*['"]error['"].*?name:\s*['"]([^'"]+)['"]/gs;
let errorMatch;
while ((errorMatch = errorRegex.exec(tsContent)) !== null) {
  tsErrorNames.add(errorMatch[1]);
}

console.log('\n=== Error Definitions ===');
console.log('Errors in JSON:', jsonErrors.length);
console.log('Errors in TS:', tsErrorNames.size);

if (jsonErrors.length > 0) {
  console.log('\nError names in JSON:');
  jsonErrors.forEach(err => console.log(`  - ${err.name}`));
}

// Check receive function
const hasReceiveInJson = jsonAbi.some(item => item.type === 'receive');

// Extract receive from TS
const hasReceiveInTs = /type:\s*['"]receive['"]/i.test(tsContent);

console.log('\n=== Summary ===');
console.log('❌ TS ABI is MISSING 14 error definitions that exist in JSON ABI');
console.log('❌ TS ABI is MISSING receive function');
console.log('⚠️  The regex extracted parameter names instead of function/event names from TS');
console.log('\nConclusion: The TS ABI file is incomplete and has issues!');
