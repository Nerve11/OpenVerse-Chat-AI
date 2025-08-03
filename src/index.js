import React, { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Используем динамический импорт для App, сначала показываем наш собственный прелоадер
const App = lazy(() => {
  // Отмечаем начало импорта App для метрик
  if (window.performance && window.performance.mark) {
    window.performance.mark('app-import-start');
  }
  
  // Используем динамический импорт с приоритетом
  const importPromise = import('./App');
  
  // После загрузки App, отмечаем это в метриках
  importPromise.then(() => {
    if (window.performance && window.performance.mark) {
      window.performance.mark('app-import-complete');
      window.performance.measure('app-import-time', 'app-import-start', 'app-import-complete');
    }
  });
  
  return importPromise;
});

// Оптимизированная версия компонента загрузки
// Использует предварительно заданные стили из CSS, чтобы не вычислять их повторно
const LoadingComponent = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p className="loading-text">Loading OpenVerse-Chat-AI...</p>
  </div>
);

// Измерение производительности с оптимизированным поведением
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function && process.env.REACT_APP_MEASURE_VITALS) {
    // Используем приоритизированную загрузку web-vitals
    import(/* webpackPrefetch: true */ 'web-vitals')
      .then((webVitals) => {
        // Выполняем только критические метрики немедленно 
        const runCriticalMetrics = () => {
          // Проверяем новые имена функций сначала (web-vitals v3+)
          if (webVitals.onLCP) {
            webVitals.onLCP(onPerfEntry); // LCP - приоритетная метрика
            webVitals.onFCP && webVitals.onFCP(onPerfEntry); // FCP - также важна
            webVitals.onTTFB && webVitals.onTTFB(onPerfEntry); // TTFB
          } 
          // Поддержка обратной совместимости (web-vitals v2 и ниже)
          else if (webVitals.getLCP) {
            webVitals.getLCP(onPerfEntry);
            webVitals.getFCP && webVitals.getFCP(onPerfEntry);
            webVitals.getTTFB && webVitals.getTTFB(onPerfEntry);
          }
        };
        
        // Запускаем критические метрики сразу
        runCriticalMetrics();
        
        // Откладываем некритичные метрики на потом
        setTimeout(() => {
          // Некритичные метрики web-vitals v3+
          if (webVitals.onCLS) {
            webVitals.onCLS(onPerfEntry);
            webVitals.onFID && webVitals.onFID(onPerfEntry);
            webVitals.onINP && webVitals.onINP(onPerfEntry);
          }
          // Некритичные метрики web-vitals v2 и ниже
          else if (webVitals.getCLS) {
            webVitals.getCLS(onPerfEntry);
            webVitals.getFID && webVitals.getFID(onPerfEntry);
          }
        }, 1000); // Отложить на 1 секунду, чтобы не мешать LCP
      })
      .catch(error => {
        console.warn('Failed to load web-vitals:', error);
      });
  }
};

// Проверка Puter.js загрузки с оптимизацией производительности
const checkPuterAvailability = () => {
  // Избегаем обращения к window.puter если скрипт еще не выполнился полностью
  try {
    if (typeof window.puter !== 'undefined' && window.puter) {
      console.debug('Puter.js loaded successfully!');
      
      // Не выполняем тяжелые проверки сразу - это может задержать рендеринг
      // Откладываем проверку API на момент после рендеринга
      setTimeout(() => {
        try {
          // Проверяем доступные API методы
          const availableMethods = [];
          if (window.puter.ai) {
            if (typeof window.puter.ai.chat === 'function') availableMethods.push('chat');
            if (typeof window.puter.ai.claudeCompletion === 'function') availableMethods.push('claudeCompletion');
            if (typeof window.puter.ai.completion === 'function') availableMethods.push('completion');
          }
          console.debug('Available Puter AI methods:', availableMethods);
          
          // Дополнительная проверка доступа к Claude 3.7
          try {
            // Проверяем, что метод claudeCompletion работает с моделью claude-3-sonnet
            if (window.puter.ai.claudeCompletion && 
                typeof window.puter.ai.claudeCompletion.toString() === 'function' &&
                window.puter.ai.claudeCompletion.toString().indexOf('claude-3-sonnet') !== -1) {
              console.debug('Claude 3.7 Sonnet access confirmed via Puter.js');
            } else {
              console.warn('Claude 3.7 Sonnet access might be limited via Puter.js');
            }
          } catch (checkErr) {
            console.warn('Error checking Claude access:', checkErr);
          }
        } catch (err) {
          console.warn('Error checking Puter AI methods:', err);
        }
      }, 1000);
      
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.warn('Error checking Puter availability:', error);
    return false;
  }
};

// Оптимизированная функция для рендеринга приложения
// с приоритетом на быстрый первоначальный рендеринг
const renderApp = (isPuterAvailable, hasTimeout) => {
  // Отмечаем время начала рендеринга
  if (window.performance && window.performance.mark) {
    window.performance.mark('render-start');
  }

  const container = document.getElementById('root');
  const root = createRoot(container);
  
  // Рендерим приложение
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Suspense fallback={<LoadingComponent />}>
          <App 
            puterLoaded={isPuterAvailable} 
            puterTimeout={hasTimeout && !isPuterAvailable}
          />
        </Suspense>
      </ErrorBoundary>
    </StrictMode>
  );
  
  // Отмечаем завершение рендеринга
  if (window.performance && window.performance.mark) {
    window.performance.mark('render-complete');
    window.performance.measure('render-time', 'render-start', 'render-complete');
  }
  
  // Запускаем измерение метрик после рендеринга
  reportWebVitals(console.debug);
  
  // Удаляем прелоадер, если он еще существует
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    // Скрываем прелоадер с небольшой задержкой для плавности
    setTimeout(() => {
      if (window.HIDE_PRELOADER && typeof window.HIDE_PRELOADER === 'function') {
        window.HIDE_PRELOADER();
      } else {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 300);
      }
    }, 500);
  }
};

// Ускоряем первоначальный рендеринг путем сокращения времени ожидания Puter.js
// Изначально рендерим без проверки Puter, затем обновляем статус
let initialRenderDone = false;
let puterChecks = 0;
const maxPuterChecks = 20; // Уменьшаем максимум до 4 секунд (20 * 200мс)

// Показываем пользователю приложение быстрее
const checkAndRender = () => {
  const isPuterAvailable = checkPuterAvailability();
  puterChecks++;
  
  // Если puter доступен или исчерпаны попытки, рендерим приложение
  if (isPuterAvailable || puterChecks >= maxPuterChecks) {
    renderApp(isPuterAvailable, puterChecks >= maxPuterChecks);
    initialRenderDone = true;
  } 
  // Если достигли половины времени и все еще нет Puter, рендерим без него
  else if (puterChecks === Math.floor(maxPuterChecks / 2) && !initialRenderDone) {
    // Рендерим приложение с маркировкой, что мы все еще ждем Puter
    renderApp(false, false);
    initialRenderDone = true;
    
    // Продолжаем проверять Puter в фоне
    const continuedCheck = () => {
      const isPuterAvailable = checkPuterAvailability();
      puterChecks++;
      
      if (isPuterAvailable || puterChecks >= maxPuterChecks) {
        // Обновляем статус путем реинициализации приложения
        // (React возьмет на себя дифференциальное обновление)
        renderApp(isPuterAvailable, puterChecks >= maxPuterChecks);
      } else {
        setTimeout(continuedCheck, 200);
      }
    };
    
    setTimeout(continuedCheck, 200);
  }
  // Если не рендерили и не достигли порога, продолжаем проверки
  else if (!initialRenderDone) {
    setTimeout(checkAndRender, 200);
  }
};

// Начинаем проверять Puter
checkAndRender();

// Регистрация Service Worker в фоновом режиме,
// чтобы не блокировать основной поток
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Откладываем регистрацию, чтобы не конкурировать с основными задачами
    setTimeout(() => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.debug('ServiceWorker registered:', registration.scope);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed:', error);
        });
    }, 3000); // Отложить на 3 секунды после загрузки
  });
}

// Добавляем глобальный обработчик необработанных отклонений обещаний
window.addEventListener('unhandledrejection', (event) => {
  // Предотвращаем отображение ошибки в overlay
  event.preventDefault();
  
  // Логируем ошибку в консоль
  console.warn('Необработанное отклонение обещания (предотвращено отображение overlay):', event.reason);
}); 