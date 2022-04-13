import { StrictMode } from 'react';
import { render } from 'react-dom';
import moment from 'moment';
import 'moment/dist/locale/zh-cn';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';

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

render(
  <StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </StrictMode>,
  document.getElementById('app')
);
