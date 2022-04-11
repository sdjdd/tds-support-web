import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';
import 'moment/locale/zh-cn';

import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import 'github-markdown-css/github-markdown-light.css';
import './index.css';
import App from './App';

moment.locale('zh-cn');

if (import.meta.env.VITE_SENTRY_WEB_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_WEB_DSN,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
    ignoreErrors: [],
    enabled: import.meta.env.PROD,
    initialScope: {
      tags: {
        type: 'web',
      },
    },
  });
}

const container = document.getElementById('app')!;
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
