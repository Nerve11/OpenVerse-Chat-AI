import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('lang', lang);
    } catch {}
  };

  return (
    <select
      className="lang-switcher"
      value={i18n.language}
      onChange={handleChange}
      title={t('langs.' + (i18n.language || 'en'))}
    >
      <option value="en">{t('langs.en')}</option>
      <option value="ru">{t('langs.ru')}</option>
      <option value="zh">{t('langs.zh')}</option>
    </select>
  );
};

export default LanguageSwitcher;
