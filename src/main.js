import { createApp, watch } from 'vue'
import './style.css'
import App from './App.vue'
import { createI18n } from 'vue-i18n';
import zhCN from './locales/zh-CN.json';
import en from './locales/en.json';

let locale = localStorage.getItem('locale');

if (!locale) {
  locale = navigator.language === 'zh-CN' ? '中文（简体）' : 'English';
}

console.log(locale);
const i18n = createI18n({
  locale,
  fallbackLocale: 'English',
  messages: {
    '中文（简体）': zhCN,
    'English': en
  }
});

watch(() => i18n.global.locale, () => {
  localStorage.setItem('locale', i18n.global.locale);
  location.reload();
});

createApp(App).use(i18n).mount('#app');
