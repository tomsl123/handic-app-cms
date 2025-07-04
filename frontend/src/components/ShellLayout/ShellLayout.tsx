// src/components/ShellLayout.tsx
import { useState } from 'react';
import {
    AppShell,
    Burger,
    Container,
    Group,
    Text,
    Button,
    Drawer,
    ScrollArea,
    Divider,
    Select, Stack, Box,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import classes from './HeaderSimple.module.css';
import { setAuthToken } from '@/api';

const navLinks = [
    { link: '/', key: 'Home' },
    { link: '/events', key: 'Events' },
    { link: '/about', key: 'About' },
    { link: '/community', key: 'Community' },
];

const languages = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
];

export default function ShellLayout() {
    // drawer state
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    // active link
    const [active, setActive] = useState(navLinks[0].link);
    // navigation & i18n
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const isAuthenticated = Boolean(localStorage.getItem('handicapp_jwt'));

    // build link items
    const items = navLinks.map(({ link, key }) => (
        <Link
            key={link}
            to={link}
            className={classes.link}
            data-active={active === link ? '' : undefined}
            onClick={(e) => {
                e.preventDefault();
                setActive(link);
                navigate(link);
                closeDrawer();
            }}
        >
            {t(key)}
        </Link>
    ));

    const logout = () => {
        setAuthToken(null);
        navigate('/login');
        closeDrawer();
    };

    return (
        <AppShell
            padding="md"
            header={{ height: 60 }}
        >
            {/* HEADER */}
            <AppShell.Header style={{ backgroundColor: '#d0d0d0' }}>
                <Container size="lg" className={classes.inner}>
                    {/* Logo */}
                    <Text fw={700} size="lg">
                        Handic.app
                    </Text>

                    {/* Desktop nav links */}
                    <Group gap={20} visibleFrom="sm">
                        {items}
                    </Group>

                    {/* right side: lang selector & auth */}
                    <Group gap="sm" visibleFrom="sm">
                        <Select
                            size="xs"
                            variant="unstyled"
                            data={languages}
                            value={i18n.language || 'en'}
                            onChange={(val) => val && i18n.changeLanguage(val)}
                            classNames={{ input: classes.langSelect }}
                            allowDeselect={false}
                        />

                        {isAuthenticated ? (
                            <Button variant="outline" size="xs" onClick={logout}>
                                {t('Logout')}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="xs"
                                    component={Link}
                                    to="/login"
                                    onClick={() => setActive('/login')}
                                >
                                    {t('Login')}
                                </Button>
                                <Button
                                    size="xs"
                                    component={Link}
                                    to="/register"
                                    onClick={() => setActive('/register')}
                                >
                                    {t('Register')}
                                </Button>
                            </>
                        )}
                    </Group>

                    {/* mobile burger */}
                    <Burger
                        opened={drawerOpened}
                        onClick={toggleDrawer}
                        hiddenFrom="sm"
                        size="sm"
                    />
                </Container>
            </AppShell.Header>

            {/* MOBILE DRAWER */}
            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                hiddenFrom="sm"
                padding="md"
                title={t('Home')}
            >
                <Box mx="auto" px="md" style={{ maxWidth: 340 }}>
                    <Stack gap="md" mt="md">
                        {items}

                        <Divider />

                        <Select
                            data={languages}
                            value={i18n.language}
                            onChange={(val) => val && i18n.changeLanguage(val)}
                            placeholder={t('Language')}
                        />

                        <Divider />

                        {isAuthenticated ? (
                            <Button fullWidth variant="outline" onClick={logout}>
                                {t('Logout')}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    fullWidth
                                    onClick={() => {
                                        closeDrawer();
                                        navigate('/login');
                                    }}
                                >
                                    {t('Login')}
                                </Button>
                                <Button
                                    fullWidth
                                    onClick={() => {
                                        closeDrawer();
                                        navigate('/register');
                                    }}
                                >
                                    {t('Register')}
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>
            </Drawer>

            {/* MAIN CONTENT */}
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
