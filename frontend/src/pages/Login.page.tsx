import React from 'react';
import { Container, Paper, TextInput, PasswordInput, Button, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, Link } from 'react-router-dom';
import { api, setAuthToken } from '@/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const form = useForm({
        initialValues: { identifier: '', password: '' },
        validate: {
            identifier: (v) => (/^\S+@\S+$/.test(v) ? null : 'Enter a valid email'),
            password: (v) => (v.length >= 6 ? null : 'Password too short'),
        },
    });

    const handleSubmit = async (vals: typeof form.values) => {
        try {
            const { data } = await api.post('/auth/local', {
                identifier: vals.identifier,
                password: vals.password,
            });
            setAuthToken(data.jwt);
            navigate('/events');
        } catch {
            form.setFieldError('identifier', 'Invalid credentials');
        }
    };

    return (
        <Container size={420} my="xl">
            <Title align="center">Welcome back</Title>
            <Paper withBorder shadow="md" p={30} mt={30} radius="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput label="Email" placeholder="me@example.com" {...form.getInputProps('identifier')} required />
                        <PasswordInput label="Password" placeholder="Your password" {...form.getInputProps('password')} required />
                        <Button fullWidth type="submit" mt="md">
                            Login
                        </Button>
                    </Stack>
                </form>
                <Text size="sm" mt="md" align="center">
                    No account yet? <Link to="/register">Create one</Link>
                </Text>
            </Paper>
        </Container>
    );
}