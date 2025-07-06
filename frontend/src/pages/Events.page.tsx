import { useEffect, useState } from 'react';
import {
    Avatar,
    Box,
    Card,
    Container,
    Divider,
    Group,
    Image,
    Loader,
    Stack,
    Text,
    ThemeIcon,
} from '@mantine/core';
import {
    MdCalendarToday,
    MdCategory,
    MdLocationOn,
    MdPerson,
} from 'react-icons/md';
import * as MuiIcons from '@mui/icons-material';
import { api } from '@/api';
import '@/i18n';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type StrapiImage = {
    url: string;
    formats?: { thumbnail?: { url: string }, medium?: { url: string } };
};

type EventItem = {
    id: number;
    documentId: string;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    event_type: string;
    media: StrapiImage[];
    organizer: { name: string };
    location: { name: string; documentId: string };
};

function getMaterialIcon(name: string) {
    if (!name) return MuiIcons.AccessibilityNew;
    const pascal = name
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    return (MuiIcons as any)[pascal] || (MuiIcons as any)[name] || MuiIcons.AccessibilityNew;
}

export default function EventsPage() {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [iconsByEvent, setIconsByEvent] = useState<Record<number, string[]>>({});
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();

    /* ---------------- Fetch events ---------------- */
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get('/events', {
                    params: { populate: '*', locale: i18n.language },
                });
                setEvents(data.data.map((d: any) => d.attributes ?? d));
            } finally {
                setLoading(false);
            }
        })();
    }, [i18n.language]);

    /* -------- Fetch accessibility icons per event -------- */
    useEffect(() => {
        if (events.length === 0) return;
        (async () => {
            const mapping: Record<number, string[]> = {};
            await Promise.all(
                events.map(async (evt) => {
                    const locDocId = evt.location?.documentId;
                    if (!locDocId) return;
                    const res = await api.get(`/locations/${locDocId}`, {
                        params: {
                            locale: i18n.language,
                            'populate[accessibility_features][populate]': 'accessibility_need',
                        },
                    });
                    const features = res.data.data.accessibility_features ?? [];
                    // @ts-ignore
                    mapping[evt.id] = [
                        ...new Set(
                            features
                                .map((f: any) => f.accessibility_need?.Icon)
                                .filter(Boolean),
                        ),
                    ];
                }),
            );
            setIconsByEvent(mapping);
        })();
    }, [events, i18n.language]);

    if (loading) {
        return (
            <Container my="lg">
                <Group justify="center">
                    <Loader />
                </Group>
            </Container>
        );
    }

    return (
        <Container size="lg" my="lg">
            <Stack gap="md">
                {events.map((evt) => {
                    const imgPath =
                        evt.media?.[0]?.formats?.medium?.url ?? evt.media?.[0]?.url ?? 'https://placehold.co/600x400?text=No+Image';
                    const imgSrc = imgPath.startsWith('http')
                        ? imgPath
                        : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${imgPath}`;

                    const accessibilityIcons = (iconsByEvent[evt.id] || []).map((iconName) => {
                        const IconCmp = getMaterialIcon(iconName);
                        return (
                            <ThemeIcon
                                key={iconName}
                                variant="light"
                                color="secondary"
                                radius="xl"
                                size={40}
                            >
                                <IconCmp fontSize="small" />
                            </ThemeIcon>
                        );
                    });

                    /* ----- Info groups (reused) ----- */
                    const InfoGroups = (
                        <>
                            <Group gap={4} wrap="nowrap">
                                <ThemeIcon variant="subtle" size="sm">
                                    <MdCategory />
                                </ThemeIcon>
                                <Text size="sm">{evt.event_type}</Text>
                            </Group>

                            <Divider orientation="vertical" visibleFrom="md" />

                            <Group gap={4} wrap="nowrap">
                                <ThemeIcon variant="subtle" size="sm">
                                    <MdCalendarToday />
                                </ThemeIcon>
                                <Text size="sm">
                                    {dayjs(evt.start_time).format('DD MMM YYYY')} &ndash;{' '}
                                    {dayjs(evt.end_time).format('DD MMM YYYY')}
                                </Text>
                            </Group>

                            <Divider orientation="vertical" visibleFrom="md" />

                            <Group gap={4} wrap="nowrap">
                                <ThemeIcon variant="subtle" size="sm">
                                    <MdPerson />
                                </ThemeIcon>
                                <Text size="sm">{evt.organizer?.name}</Text>
                            </Group>

                            <Divider orientation="vertical" visibleFrom="md" />

                            <Group gap={4} wrap="nowrap">
                                <ThemeIcon variant="subtle" size="sm">
                                    <MdLocationOn />
                                </ThemeIcon>
                                <Text size="sm">{evt.location?.name}</Text>
                            </Group>
                        </>
                    );

                    return (
                        <Link
                            key={evt.id}
                            to={`/events/${evt.documentId}`}
                            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                        >
                            <Card shadow="sm" padding="md" radius="md" withBorder>
                                {/* ------------ ≥ sm layout ------------ */}
                                <Group align="center" wrap="nowrap" visibleFrom="sm">
                                    <Avatar src={imgSrc} radius="xl" size={80} />

                                    <Box ml="md" w="100%">
                                        <Text fw={700} size="lg">
                                            {evt.name}
                                        </Text>

                                        <Group gap="xs" mt={4} wrap="nowrap">
                                            {InfoGroups}
                                            <Group ml="auto" gap={4}>
                                                {accessibilityIcons}
                                            </Group>
                                        </Group>
                                    </Box>
                                </Group>

                                {/* ------------ Mobile (< sm) ------------ */}
                                <Stack gap="xs" hiddenFrom="sm">
                                    <Image src={imgSrc} height={180} radius="md" fit="cover" />

                                    <Text fw={700} size="lg" mt="xs">
                                        {evt.name}
                                    </Text>

                                    <Stack gap={4}>{InfoGroups}</Stack>

                                    <Group gap={4}>{accessibilityIcons}</Group>
                                </Stack>
                            </Card>
                        </Link>
                    );
                })}
            </Stack>
        </Container>
    );
}
