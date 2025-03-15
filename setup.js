const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk'); // Для цветного вывода в консоль

console.log(chalk.blue.bold('🚀 Настройка проекта Claude 3.7 Sonnet Chat UI...'));

// Базовый путь проекта
const projectRoot = process.cwd();

// Создаем .env файл если он не существует
const envFile = path.join(projectRoot, '.env');
const envContent = `# Преобразование ошибок ESLint в предупреждения при разработке
ESLINT_NO_DEV_ERRORS=true
# Включение режима показа Веб-Витальных в консоли разработчика
REACT_APP_MEASURE_VITALS=true
`;

// Создаем структуру каталогов, необходимых для проекта
const directories = [
  'public/images',
  'src/components',
  'src/utils',
  'src/contexts',
];

// Создаем .eslintrc.json если он не существует
const eslintFile = path.join(projectRoot, '.eslintrc.json');
const eslintContent = `{
  "extends": ["react-app", "react-app/jest"],
  "globals": {
    "puter": "readonly"
  }
}
`;

try {
  // Создаем необходимые директории
  directories.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(chalk.green(`✅ Создана директория: ${dir}`));
    }
  });

  // Создаем .env файл
  if (!fs.existsSync(envFile)) {
    fs.writeFileSync(envFile, envContent);
    console.log(chalk.green('✅ Создан .env файл с настройками'));
  } else {
    console.log(chalk.yellow('ℹ️ .env файл уже существует, пропускаем...'));
  }

  // Создаем .eslintrc.json файл
  if (!fs.existsSync(eslintFile)) {
    fs.writeFileSync(eslintFile, eslintContent);
    console.log(chalk.green('✅ Создан .eslintrc.json файл'));
  } else {
    console.log(chalk.yellow('ℹ️ .eslintrc.json файл уже существует, пропускаем...'));
  }

  // Проверка и установка зависимостей
  console.log(chalk.blue('📦 Проверка и установка зависимостей...'));
  
  const packageJsonPath = path.join(projectRoot, 'package.json');
  
  // Проверяем существование package.json
  if (!fs.existsSync(packageJsonPath)) {
    console.log(chalk.yellow('⚠️ package.json не найден, создаем новый...'));
    
    const packageJson = {
      "name": "claude-chat-ui",
      "version": "0.2.0",
      "private": true,
      "dependencies": {
        "axios": "^1.6.2",
        "framer-motion": "^10.16.4",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-icons": "^4.12.0",
        "react-markdown": "^9.0.1",
        "react-scripts": "5.0.1",
        "react-syntax-highlighter": "^15.5.0",
        "styled-components": "^6.1.1",
        "web-vitals": "^3.5.0"
      },
      "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      "eslintConfig": {
        "extends": [
          "react-app",
          "react-app/jest"
        ]
      },
      "browserslist": {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('✅ Создан package.json'));
  }

  // Устанавливаем chalk если он еще не установлен
  try {
    require.resolve('chalk');
  } catch (e) {
    console.log(chalk.yellow('⚠️ Пакет chalk не найден, устанавливаем...'));
    execSync('npm install --save-dev chalk@4.1.2', { stdio: 'inherit' });
  }

  // Устанавливаем зависимости
  console.log(chalk.blue('📦 Устанавливаем все зависимости...'));
  execSync('npm install', { stdio: 'inherit' });

  // Проверка, что установлен Puter.js или информация о нем
  console.log(chalk.yellow('ℹ️ Примечание: Puter.js загружается динамически через CDN'));
  console.log(chalk.yellow('ℹ️ В проекте используется: https://js.puter.com/v2/'));

  // Проверка завершена, запускаем проект
  console.log(chalk.green.bold('\n🎉 Настройка завершена! Запускаем сервер разработки...'));
  console.log(chalk.blue('⌚ Это может занять несколько секунд...'));
  
  // Запуск сервера разработки с помощью реакта
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error(chalk.red(`❌ Ошибка при настройке: ${error.message}`));
  process.exit(1);
} 