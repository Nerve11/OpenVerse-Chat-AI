const fs = require('fs');
const { execSync } = require('child_process');

console.log('🚀 Setting up Claude 3.7 Chat UI project...');

try {
  // Create necessary directories if they don't exist
  ['public/images', 'src/components', 'src/utils'].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Start the development server
  console.log('\n🎉 Setup complete! Starting development server...');
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error during setup:', error.message);
  process.exit(1);
} 