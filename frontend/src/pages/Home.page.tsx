import { Box, Button, Container, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { MdAccessibilityNew, MdEventAvailable, MdVerifiedUser } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function HomePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const Feature = ({
                         icon,
                         titleKey,
                         descKey,
                     }: {
        icon: React.ReactNode;
        titleKey: string;
        descKey: string;
    }) => (
        <Stack align="center" gap={6} ta="center">
            <ThemeIcon size={48} radius="xl" variant="light" color="primary">
                {icon}
            </ThemeIcon>
            <Text fw={600}>{t(titleKey)}</Text>
            <Text c="dimmed" fz="sm">
                {t(descKey)}
            </Text>
        </Stack>
    );

    return (
        <Box pt={80} pb={60}>
            {/* Hero */}
            <Container size="lg">
                <Stack align="center" gap="md" maw={700} mx="auto">
                    <Title ta="center" order={1}>
                        {t('HomePage.Title')}
                    </Title>
                    <Text ta="center" fz="lg" c="dimmed">
                        {t('HomePage.Subtitle')}
                    </Text>
                    <Group gap="md">
                        <Button size="md" onClick={() => navigate('/events')}>
                            {t('HomePage.BrowseEvents')}
                        </Button>
                        <Button size="md" variant="outline" onClick={() => navigate('/register')}>
                            {t('HomePage.SignUp')}
                        </Button>
                    </Group>
                </Stack>
            </Container>

            {/* Features */}
            <Container size="lg" mt={80}>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" verticalSpacing="xl">
                    <Feature
                        icon={<MdAccessibilityNew size={28} />}
                        titleKey="HomePage.Feature1.Title"
                        descKey="HomePage.Feature1.Desc"
                    />
                    <Feature
                        icon={<MdEventAvailable size={28} />}
                        titleKey="HomePage.Feature2.Title"
                        descKey="HomePage.Feature2.Desc"
                    />
                    <Feature
                        icon={<MdVerifiedUser size={28} />}
                        titleKey="HomePage.Feature3.Title"
                        descKey="HomePage.Feature3.Desc"
                    />
                </SimpleGrid>
            </Container>
        </Box>
    );
}
