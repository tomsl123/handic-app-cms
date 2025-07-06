// src/pages/RegisterPage.tsx
import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Stack,
    Title,
    Select,
    MultiSelect,
    FileInput,
    Group,
    Text,
    LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api';
import {DatePickerInput, DatesProvider} from "@mantine/dates";
import {useTranslation} from "react-i18next";
import '@/i18n';
import 'dayjs/locale/en';
import 'dayjs/locale/de';
import 'dayjs/locale/fr';
import 'dayjs/locale/es';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [needsOptions, setNeedsOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const { t, i18n } = useTranslation();

    // ─── fetch accessibility-need options ───────────────────────
    useEffect(() => {
        api
            .get('/accessibility-needs', {
                params: {locale: i18n.language},
            })
            .then((res) => {
                setNeedsOptions(
                    res.data.data.map((item: { name: String; id: number }) => ({label: item.name, value: item.id.toString()})),
                )
            }

            )
            .catch(() => {});
    }, []);

    // ─── form setup ─────────────────────────────────────────────
    const form = useForm({
        initialValues: {
            username: '',
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            birthDate: new Date(),
            primaryLanguage: '',
            disabilityCardNumber: '',
            disabilityCardFile: null as File | null,
            accessibilityNeeds: [] as string[],
            issueDate: new Date(),
            expiryDate: new Date(),
        },

        validate: {
            username: (v) => (v.trim().length < 2 ? t("UsernameTooShort") : null),
            firstName: (v) => (!v ? t("Required") : null),
            lastName: (v) => (!v ? t("Required") : null),
            email: (v) => (/^\S+@\S+$/.test(v) ? null : t("InvalidEmail")),
            password: (v) => (v.length < 6 ? t("PasswordTooShort") : null),
            primaryLanguage: (v) => (!v ? t("Required") : null),
            disabilityCardNumber: (v) => (!v ? t("Required") : null),
            disabilityCardFile: (v) => (!v ? t("Required") : null),
            accessibilityNeeds: (v: string[]) =>
                v.length === 0 ? t("Required") : null,
        },
    });

    // ─── submit handler ─────────────────────────────────────────
    const handleSubmit = async (vals: typeof form.values) => {
        setLoading(true);

        try {
            // 1) upload card file
            const fd = new FormData();
            fd.append('files', vals.disabilityCardFile!);
            const [{ id: fileId }] = (await api.post('/upload', fd)).data;

            // 2) create disability-card record
            const { data: card } = await api.post('/disability-cards', {
                data: {
                    number: vals.disabilityCardNumber,
                    proof: fileId,
                    reviewStatus: 'unreviewed',
                    issueDate: vals.issueDate,
                    expiry: vals.expiryDate,
                },
            });

            // 3) create user (Strapi extended user model)
            await api.post('/auth/local/register', {
                username: vals.username,
                email: vals.email,
                password: vals.password,
                firstName: vals.firstName,
                lastName: vals.lastName,
                birthDate: vals.birthDate,
                language: vals.primaryLanguage,
                disability_card: card.id,
                accessibility_needs: vals.accessibilityNeeds.map(Number),
            });

            navigate('/login');
        } catch (e) {
            alert("Registration failed with error: " + e);
        } finally {
            setLoading(false);
        }
    };

    // ─── UI ─────────────────────────────────────────────────────
    return (
        <Container size={640} my="xl">
            <LoadingOverlay visible={loading} />
            <Title ta="center">{t("CreateAccountTitle")}</Title>

            <Paper withBorder shadow="md" p={32} mt={24} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput label={t("FirstName")} {...form.getInputProps('firstName')} required />
                            <TextInput label={t("LastName")} {...form.getInputProps('lastName')} required />
                        </Group>

                        <DatesProvider settings={{locale: i18n.language }}>
                            <DatePickerInput
                                label={t("BirthDate")}
                                {...form.getInputProps('birthDate')}
                                maxDate={new Date()}
                                required
                            />
                        </DatesProvider>

                        <Select
                            label={t("PrimaryLanguage")}
                            placeholder={t("Select")}
                            data={[
                                { value: "english", label: t("English") },
                                { value: "german", label: t("German") },
                                { value: "french", label: t("French") },
                                { value: "spanish", label: t("Spanish ") },
                            ]}
                            {...form.getInputProps('primaryLanguage')}
                            required
                        />

                        <TextInput label={t("Email")} {...form.getInputProps('email')} required />
                        <TextInput label={t("Username")} {...form.getInputProps('username')} required />
                        <PasswordInput label={t("Password")} {...form.getInputProps('password')} required />

                        <Group grow>
                            <TextInput
                                label={t("DisabilityCardNumber")}
                                {...form.getInputProps('disabilityCardNumber')}
                                required
                            />
                            <FileInput
                                label={t("DisabilityCardFile")}
                                accept="image/*,application/pdf"
                                placeholder={t("UploadProof")}
                                {...form.getInputProps('disabilityCardFile')}
                                required
                            />
                        </Group>
                        <Group grow>
                            <DatesProvider settings={{locale: i18n.language }}>
                                <DatePickerInput
                                    label={t("IssueDate")}
                                    {...form.getInputProps('issueDate')}
                                    maxDate={new Date()}
                                    required
                                />
                                <DatePickerInput
                                    label={t("ExpiryDate")}
                                    {...form.getInputProps('expiryDate')}
                                    minDate={new Date()}
                                    required
                                />
                            </DatesProvider>
                        </Group>

                        <MultiSelect
                            data={needsOptions}
                            label={t("AccessibilityNeeds")}
                            placeholder={t("SelectNeeds")}
                            {...form.getInputProps('accessibilityNeeds')}
                            required
                        />

                        <Button type="submit" fullWidth mt="md">
                            {t("Register")}
                        </Button>
                    </Stack>
                </form>

                <Text size="sm" mt="md" ta="center">
                    {t("HaveAnAccount")} <Link to="/login">{t("Login")}</Link>
                </Text>
            </Paper>
        </Container>
    );
}
