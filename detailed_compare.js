const fs = require('fs');

// Read JSON ABI
const jsonArtifact = require('./EasySwapContract/artifacts/contracts/EasySwapOrderBook.sol/EasySwapOrderBook.json');
const jsonAbi = jsonArtifact.abi;

// Read TS ABI
const tsContent = fs.readFileSync('./nft-market-next/lib/contracts/abis/EasySwapOrderBook.ts', 'utf8');

console.log('=== Detailed ABI Comparison ===\n');

// Count by type in JSON
const jsonByType = {};
jsonAbi.forEach(item => {
  jsonByType[item.type] = (jsonByType[item.type] || 0) + 1;
});

console.log('JSON ABI breakdown:');
Object.entries(jsonByType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

// Extract structured data from TS
const tsItems = [];
let currentItem = null;
const lines = tsContent.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check for type field
  const typeMatch = line.match(/type:\s*['"]([^'"]+)['"]/);
  if (typeMatch) {
    if (currentItem) {
      tsItems.push(currentItem);
    }
    currentItem = { type: typeMatch[1], line: i + 1 };
    continue;
  }
  
  // Check for name field
  const nameMatch = line.match(/name:\s*['"]([^'"]+)['"]/);
  if (nameMatch && currentItem) {
    currentItem.name = nameMatch[1];
  }
}

if (currentItem) {
  tsItems.push(currentItem);
}

// Count by type in TS
const tsByType = {};
tsItems.forEach(item => {
  tsByType[item.type] = (tsByType[item.type] || 0) + 1;
});

console.log('\nTS ABI breakdown:');
Object.entries(tsByType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

// Find missing error definitions
const jsonErrors = jsonAbi.filter(item => item.type === 'error').map(item => item.name);
const tsErrors = tsItems.filter(item => item.type === 'error').map(item => item.name);

console.log('\n=== Error Definitions Comparison ===');
console.log(`JSON has ${jsonErrors.length} errors, TS has ${tsErrors.length} errors`);

const missingErrors = jsonErrors.filter(name => !tsErrors.includes(name));
if (missingErrors.length > 0) {
  console.log('\n❌ Missing error definitions in TS:');
  missingErrors.forEach(name => console.log(`    - ${name}`));
}

// Check receive
const hasReceiveJson = jsonAbi.some(item => item.type === 'receive');
const hasReceiveTs = tsItems.some(item => item.type === 'receive');

console.log('\n=== Receive Function ===');
console.log(`JSON has receive: ${hasReceiveJson}`);
console.log(`TS has receive: ${hasReceiveTs}`);

if (hasReceiveJson && !hasReceiveTs) {
  console.log('❌ Missing receive function in TS');
}

// List all events in both
const jsonEvents = jsonAbi.filter(item => item.type === 'event').map(item => item.name);
const tsEvents = tsItems.filter(item => item.type === 'event').map(item => item.name);

console.log('\n=== Events Comparison ===');
console.log(`JSON has ${jsonEvents.length} events, TS has ${tsEvents.length} events`);

const missingEvents = jsonEvents.filter(name => !tsEvents.includes(name));
if (missingEvents.length > 0) {
  console.log('Missing events in TS:');
  missingEvents.forEach(name => console.log(`  - ${name}`));
} else {
  console.log('✓ All events present');
}

// List all functions in both
const jsonFunctions = jsonAbi.filter(item => item.type === 'function').map(item => item.name);
const tsFunctions = tsItems.filter(item => item.type === 'function').map(item => item.name);

console.log('\n=== Functions Comparison ===');
console.log(`JSON has ${jsonFunctions.length} functions, TS has ${tsFunctions.length} functions`);

const missingFunctions = jsonFunctions.filter(name => !tsFunctions.includes(name));
if (missingFunctions.length > 0) {
  console.log('Missing functions in TS:');
  missingFunctions.forEach(name => console.log(`  - ${name}`));
} else {
  console.log('✓ All functions present');
}

const extraFunctions = tsFunctions.filter(name => !jsonFunctions.includes(name));
if (extraFunctions.length > 0) {
  console.log('Extra functions in TS (not in JSON):');
  extraFunctions.forEach(name => console.log(`  - ${name}`));
}

console.log('\n=== FINAL VERDICT ===');
const hasIssues = missingErrors.length > 0 || (!hasReceiveTs && hasReceiveJson) || missingEvents.length > 0 || missingFunctions.length > 0;
if (hasIssues) {
  console.log('❌ TS ABI file HAS ISSUES and needs to be updated!');
  if (missingErrors.length > 0) console.log(`   - Add ${missingErrors.length} missing error definitions`);
  if (!hasReceiveTs && hasReceiveJson) console.log('   - Add missing receive function');
  if (missingEvents.length > 0) console.log(`   - Fix ${missingEvents.length} missing events`);
  if (missingFunctions.length > 0) console.log(`   - Fix ${missingFunctions.length} missing functions`);
} else {
  console.log('✓ TS ABI matches JSON ABI');
}
