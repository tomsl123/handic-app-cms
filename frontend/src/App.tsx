import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/carousel/styles.css';

import { MantineProvider } from '@mantine/core';
import { Router } from './Router';
import { theme } from './theme';
import {useEffect} from "react";
import './i18n';
import {useTranslation} from "react-i18next";

export default function App() {
    const { i18n } = useTranslation();
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('handicapp_user') || 'null');
        if (saved?.language) {
            const map = { english: 'en', german: 'de-DE', french: 'fr', spanish: 'es' };
            // @ts-ignore
            i18n.changeLanguage(map[saved.language.toLowerCase()] || 'en');
        }
    }, []);
  return (
    <MantineProvider theme={theme}>
      <Router />
    </MantineProvider>
  );
}
