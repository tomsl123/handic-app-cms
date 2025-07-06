import React from 'react';
import { Container, Paper, TextInput, PasswordInput, Button, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router-dom';
import { api, setAuthToken } from '@/api';
import {useTranslation} from "react-i18next";
import '@/i18n';

export default function LoginPage() {
    const navigate = useNavigate();
    const form = useForm({
        initialValues: { identifier: '', password: '' },
        validate: {
            identifier: (v) => (/^\S+@\S+$/.test(v) ? null : t("invalidEmail")),
            password: (v) => (v.length >= 6 ? null : t("PasswordTooShort")),
        },
    });
    const { t, i18n } = useTranslation();

    const handleSubmit = async (vals: typeof form.values) => {
        try {
            const { data } = await api.post('/auth/local', {
                identifier: vals.identifier,
                password: vals.password,
            });
            const { jwt, user } = data;
            setAuthToken(jwt);
            localStorage.setItem('handicapp_user', JSON.stringify(user));

            const langMap: Record<string, string> = {
                english: 'en',
                german: 'de-DE',
                french: 'fr',
                spanish: 'es',
            };
            const userLocale = langMap[(user.language || '').toLowerCase()] || 'en';
            console.log(userLocale);
            await i18n.changeLanguage(userLocale);
            navigate('/events');
        } catch {
            form.setFieldError('identifier', 'Invalid credentials');
        }
    };

    return (
        <Container size={420} my="xl">
            <Title ta="center">{t("WelcomeBackTitle")}</Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput label={t("Email")} {...form.getInputProps('identifier')} required />
                        <PasswordInput label={t("Password")} {...form.getInputProps('password')} required />
                        <Button fullWidth type="submit" mt="md">
                            {t("Login")}
                        </Button>
                    </Stack>
                </form>
                <Text size="sm" mt="md" ta="center">
                    {t("NoAccount")} <Link to="/register">{t("CreateOne")}</Link>
                </Text>
            </Paper>
        </Container>
    );
}