// Quick test script to generate a bcrypt hash
const bcrypt = require('bcrypt');

async function testHash() {
  const password = 'password123';
  const hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
  
  console.log('Testing password:', password);
  console.log('Against hash:', hash);
  console.log('Hash length:', hash.length, '(should be 60)');
  
  const result = await bcrypt.compare(password, hash);
  console.log('Match result:', result);
  
  // Generate a fresh hash
  const freshHash = await bcrypt.hash(password, 10);
  console.log('\nFresh hash generated:', freshHash);
  console.log('Fresh hash length:', freshHash.length);
  
  const freshTest = await bcrypt.compare(password, freshHash);
  console.log('Fresh hash test:', freshTest);
}

testHash();
