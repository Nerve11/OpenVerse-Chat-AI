import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        title: 'OpenVerse Chat AI',
        loading: 'Loading OpenVerse-Chat-AI...',
        connected: 'Connected',
        connecting: 'Connecting...',
        error: 'Connection error',
        welcome: 'Welcome to OpenVerse Chat AI',
      },
      sidebar: {
        models: 'Model List',
        settings: 'Settings',
      },
      systemPrompt: {
        editor: {
          title: 'System prompt',
          description: 'The system prompt defines the behavior and settings of the AI model. Use it to set context, specify a role, or define response style.',
          templatesTitle: 'Templates:',
          placeholder: 'For example: You are an experienced developer specializing in JavaScript and React...',
          previewTitle: 'Preview:',
          previewLead: 'The model will follow this instruction:',
          tipsTitle: 'Tips:',
          tips: [
            'Be specific in your instructions',
            'Specify the role the AI should play',
            'Define the answer format you want'
          ],
          save: 'Save',
          cancel: 'Cancel',
          templates: [
            {
              name: 'Programming Expert',
              text: 'You are an experienced software engineer. Provide detailed technical explanations, code examples, and tutorials when appropriate.'
            },
            {
              name: 'Code Vibe Assistant',
              text: 'You are a friendly and experienced coding assistant named Code Vibe. Help users write, debug, and improve code. Always wrap code in markdown blocks with a language tag. Be collaborative.'
            },
            {
              name: 'Creative Writer',
              text: 'You are a creative writer with a vivid imagination. Help craft engaging stories, characters, and plots. Offer original ideas and develop existing concepts.'
            },
            {
              name: 'Science Consultant',
              text: 'You are a science consultant with deep knowledge in physics, chemistry, biology, and other natural sciences. Provide accurate information and explain complex concepts clearly.'
            }
          ]
        }
      },
      controls: {
        clearChat: 'Clear Chat',
        clear: 'Clear chat',
        search: 'Search',
        debug: 'Debug',
        systemPrompt: 'System Prompt',
        editPrompt: 'Edit Prompt',
        systemPromptActive: 'System prompt active',
        systemPromptTitle: 'Configure system prompt',
        systemPromptClear: 'Clear system prompt',
        addFiles: 'Add Files',
        addFilesTitle: 'Add files or ZIP',
        processing: 'Processing…',
        testMode: 'Test Mode',
        testOn: 'ON',
        testOff: 'OFF',
        temp: 'Temp',
        temperature: 'Temperature',
        selectModel: 'Select model',
      },
      chat: {
        apiError1: 'Puter.js API is not available.',
        apiError2: 'Please ensure the Puter.js script is loaded from {{url}}',
        placeholder: 'Type your message...',
        you: 'You',
        assistant: 'AI Assistant',
      },
      message: {
        copy: 'Copy',
        copied: 'Copied!',
        discuss: 'Discuss Code',
      },
      code: {
        run: 'Run',
        runTitle: 'Run Code',
        discuss: 'Discuss',
        discussTitle: 'Discuss Code',
        copy: 'Copy',
        copied: 'Copied',
        copyTitle: 'Copy Code',
      },
      langs: {
        en: 'English',
        ru: 'Русский',
        zh: '中文',
      }
    }
  },
  ru: {
    translation: {
      app: {
        title: 'OpenVerse Chat AI',
        loading: 'Загрузка OpenVerse-Chat-AI...',
        connected: 'Подключено',
        connecting: 'Соединение...',
        error: 'Ошибка соединения',
        welcome: 'Добро пожаловать в OpenVerse Chat AI',
      },
      sidebar: {
        models: 'Список моделей',
        settings: 'Настройки',
      },
      controls: {
        clearChat: 'Очистить чат',
        clear: 'Очистить чат',
        search: 'Поиск',
        debug: 'Отладка',
        systemPrompt: 'Системный промпт',
        editPrompt: 'Редактировать промпт',
        systemPromptActive: 'Системный промпт активен',
        systemPromptTitle: 'Настроить системный промпт',
        systemPromptClear: 'Очистить системный промпт',
        addFiles: 'Добавить файлы',
        addFilesTitle: 'Добавить файлы или ZIP',
        processing: 'Обработка…',
        testMode: 'Тест режим',
        testOn: 'ВКЛ',
        testOff: 'ВЫКЛ',
        temp: 'Темп',
        temperature: 'Температура',
        selectModel: 'Выбрать модель',
      },
      systemPrompt: {
        editor: {
          title: 'Системный промпт',
          description: 'Системный промпт определяет поведение и настройки AI модели. Используйте его, чтобы задать контекст, указать роль или стиль ответов.',
          templatesTitle: 'Шаблоны:',
          placeholder: 'Например: Ты опытный разработчик, специализирующийся на JavaScript и React...',
          previewTitle: 'Предпросмотр:',
          previewLead: 'Модель будет вести себя согласно инструкции:',
          tipsTitle: 'Советы:',
          tips: [
            'Будьте конкретны в своих инструкциях',
            'Укажите роль, которую должен выполнять AI',
            'Определите желаемый формат ответов'
          ],
          save: 'Сохранить',
          cancel: 'Отмена',
          templates: [
            {
              name: 'Эксперт по программированию',
              text: 'Ты опытный программист и эксперт в области разработки программного обеспечения. Давай подробные технические объяснения, примеры кода и учебные материалы, когда это уместно.'
            },
            {
              name: 'Code Vibe Ассистент',
              text: 'Ты — дружелюбный и опытный ИИ-ассистент по программированию по имени Code Vibe. Помогай писать, отлаживать и улучшать код. Всегда оборачивай код в блоки markdown с указанием языка. Будь готов к совместной работе.'
            },
            {
              name: 'Креативный писатель',
              text: 'Ты креативный писатель с богатым воображением. Помогай в создании увлекательных историй, персонажей и сюжетов. Предлагай оригинальные идеи и развивай существующие концепции.'
            },
            {
              name: 'Научный консультант',
              text: 'Ты научный консультант с глубокими знаниями в области физики, химии, биологии и других естественных наук. Предоставляй точную научную информацию и объясняй сложные концепции простым языком.'
            }
          ]
        }
      },
      chat: {
        apiError1: 'Puter.js API недоступен.',
        apiError2: 'Убедитесь, что Puter.js загружен с {{url}}',
        placeholder: 'Введите сообщение...',
        you: 'Вы',
        assistant: 'AI Ассистент',
      },
      message: {
        copy: 'Копировать',
        copied: 'Скопировано!',
        discuss: 'Обсудить код',
      },
      code: {
        run: 'Запустить',
        runTitle: 'Выполнить код',
        discuss: 'Обсудить',
        discussTitle: 'Обсудить код',
        copy: 'Копировать',
        copied: 'Скопировано',
        copyTitle: 'Скопировать код',
      },
      langs: {
        en: 'English',
        ru: 'Русский',
        zh: '中文',
      }
    }
  },
  zh: {
    translation: {
      app: {
        title: 'OpenVerse Chat AI',
        loading: '正在加载 OpenVerse-Chat-AI...',
        connected: '已连接',
        connecting: '连接中...',
        error: '连接错误',
        welcome: '欢迎使用 OpenVerse Chat AI',
      },
      sidebar: {
        models: '模型列表',
        settings: '设置',
      },
      controls: {
        clearChat: '清空聊天',
        clear: '清空聊天',
        search: '搜索',
        debug: '调试',
        systemPrompt: '系统提示',
        editPrompt: '编辑提示',
        systemPromptActive: '系统提示已启用',
        systemPromptTitle: '配置系统提示',
        systemPromptClear: '清除系统提示',
        addFiles: '添加文件',
        addFilesTitle: '添加文件或 ZIP',
        processing: '处理中…',
        testMode: '测试模式',
        testOn: '开',
        testOff: '关',
        temp: '温度',
        temperature: '温度',
        selectModel: '选择模型',
      },
      systemPrompt: {
        editor: {
          title: '系统提示',
          description: '系统提示定义了 AI 模型的行为和设置。用它来设定上下文、指定角色或定义回答风格。',
          templatesTitle: '模板：',
          placeholder: '例如：你是一名精通 JavaScript 和 React 的资深开发者……',
          previewTitle: '预览：',
          previewLead: '模型将遵循以下指令：',
          tipsTitle: '提示：',
          tips: [
            '指令要具体明确',
            '指定 AI 应扮演的角色',
            '定义你希望得到的回答格式'
          ],
          save: '保存',
          cancel: '取消',
          templates: [
            {
              name: '编程专家',
              text: '你是一名经验丰富的软件工程师。请在合适的时候提供详细的技术解释、代码示例和教学说明。'
            },
            {
              name: 'Code Vibe 助手',
              text: '你是一位名为 Code Vibe 的友好而专业的编程助手。帮助用户编写、调试和改进代码。所有代码请使用带语言标注的 Markdown 代码块。注重协作。'
            },
            {
              name: '创意写手',
              text: '你是一位极具想象力的创意写手。帮助创作引人入胜的故事、角色和情节，提出原创想法并完善既有构思。'
            },
            {
              name: '科学顾问',
              text: '你是一位科学顾问，精通物理、化学、生物等自然科学。请提供准确的科学信息，并用通俗易懂的语言解释复杂概念。'
            }
          ]
        }
      },
      chat: {
        apiError1: '无法通过 Puter.js API 连接。',
        apiError2: '请确认 {{url}} 可访问。',
        placeholder: '输入消息...',
        you: '你',
        assistant: 'AI 助手',
      },
      message: {
        copy: '复制',
        copied: '已复制！',
        discuss: '讨论代码',
      },
      code: {
        run: '运行',
        runTitle: '运行代码',
        discuss: '讨论',
        discussTitle: '讨论代码',
        copy: '复制',
        copied: '已复制',
        copyTitle: '复制代码',
      },
      langs: {
        en: 'English',
        ru: 'Русский',
        zh: '中文',
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;