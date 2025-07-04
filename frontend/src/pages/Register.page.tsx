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
import {DatePickerInput} from "@mantine/dates";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [needsOptions, setNeedsOptions] = useState<{ value: string; label: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // ─── fetch accessibility-need options ───────────────────────
    useEffect(() => {
        api
            .get('/accessibility-needs') // → /api/accessibility-needs?populate=*
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
            username: (v) => (v.trim().length < 2 ? 'Username too short' : null),
            firstName: (v) => (!v ? 'First name required' : null),
            lastName: (v) => (!v ? 'Last name required' : null),
            email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
            password: (v) => (v.length < 6 ? 'Min 6 chars' : null),
            birthDate: (v) => (v instanceof Date ? null : 'Choose a date'),
            issueDate: (v) => (v instanceof Date ? null : 'Choose a date'),
            expiryDate: (v) => (v instanceof Date ? null : 'Choose a date'),
            primaryLanguage: (v) => (!v ? 'Select language' : null),
            disabilityCardNumber: (v) => (!v ? 'Required' : null),
            disabilityCardFile: (v) => (!v ? 'Upload required' : null),
            accessibilityNeeds: (v: string[]) =>
                v.length === 0 ? 'Select at least one need' : null,
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
            <LoadingOverlay visible={loading} overlayOpacity={0.25} />
            <Title align="center">Create account</Title>

            <Paper withBorder shadow="md" p={32} mt={24} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <Group grow>
                            <TextInput label="First name" {...form.getInputProps('firstName')} required />
                            <TextInput label="Last name" {...form.getInputProps('lastName')} required />
                        </Group>

                        <DatePickerInput
                            label="Birth date"
                            {...form.getInputProps('birthDate')}
                            maxDate={new Date()}
                            required
                        />

                        <Select
                            label="Primary language"
                            placeholder="Select"
                            data={[
                                { value: "english", label: "English" },
                                { value: "german", label: "German" },
                                { value: "french", label: "French" },
                                { value: "spanish", label: "Spanish" },
                            ]}
                            {...form.getInputProps('primaryLanguage')}
                            required
                        />

                        <TextInput label="Email" {...form.getInputProps('email')} required />
                        <TextInput label="Username" {...form.getInputProps('username')} required />
                        <PasswordInput label="Password" {...form.getInputProps('password')} required />

                        <Group grow>
                            <TextInput
                                label="Disability-card number"
                                {...form.getInputProps('disabilityCardNumber')}
                                required
                            />
                            <FileInput
                                label="Disability-card file"
                                accept="image/*,application/pdf"
                                placeholder="Upload proof"
                                {...form.getInputProps('disabilityCardFile')}
                                required
                            />
                        </Group>
                        <Group grow>
                            <DatePickerInput
                                label="Disability Card Date of Issue"
                                {...form.getInputProps('issueDate')}
                                maxDate={new Date()}
                                required
                            />
                            <DatePickerInput
                                label="Disability Card Date of Expiry"
                                {...form.getInputProps('expiryDate')}
                                minDate={new Date()}
                                required
                            />
                        </Group>

                        <MultiSelect
                            data={needsOptions}
                            label="Accessibility needs"
                            placeholder="Select needs"
                            {...form.getInputProps('accessibilityNeeds')}
                            required
                        />

                        <Button type="submit" fullWidth mt="md">
                            Register
                        </Button>
                    </Stack>
                </form>

                <Text size="sm" mt="md" align="center">
                    Have an account? <Link to="/login">Log in</Link>
                </Text>
            </Paper>
        </Container>
    );
}
