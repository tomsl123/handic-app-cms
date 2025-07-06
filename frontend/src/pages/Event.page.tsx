import React, {JSX, useEffect, useState} from 'react';
import {
    Box, Button,
    Card,
    Container,
    Group,
    Image,
    Loader,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import {
    MdCategory,
    MdCalendarToday,
    MdPeople,
    MdSchedule,
    MdWork,
    MdLanguage,
    MdLocationOn,
    MdMail,
    MdPhone,
    MdWeb,
} from 'react-icons/md';
import * as MuiIcons from '@mui/icons-material';
import {useNavigate, useParams} from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '@/api';
import { useTranslation } from 'react-i18next';
import '@/i18n';


type Media = {
    url: string;
    formats?: { medium?: { url: string } };
};

function fullUrl(path: string) {
    return path.startsWith('http')
        ? path
        : `${import.meta.env.VITE_API_BASE_URL.replace('/api', '')}${path}`;
}

function getMaterialIcon(name: string) {
    if (!name) return MuiIcons.AccessibilityNew;
    const pascal = name
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    return (MuiIcons as any)[pascal] || MuiIcons.AccessibilityNew;
}

export default function EventDetailPage() {
    const { id } = useParams(); // documentId in URL
    const { t, i18n } = useTranslation();
    const [event, setEvent] = useState<any>(null);
    const [locationDetails, setLocationDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    /* ------------ fetch event ------------ */
    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/events/${id}`, {
                    params: { locale: i18n.language, populate: '*' },
                });
                const ev = data.data.attributes ?? data.data; // v4 or flat
                setEvent(ev);

                /* fetch location with accessibility details */
                if (ev.location?.documentId) {
                    const locRes = await api.get(`/locations/${ev.location.documentId}`, {
                        params: {
                            locale: i18n.language,
                            'populate[accessibility_features][populate]': 'accessibility_need',
                            populate: 'media',
                        },
                    });
                    setLocationDetails(locRes.data.data);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id, i18n.language]);

    if (loading || !event) {
        return (
            <Container my="lg">
                <Group justify="center">
                    <Loader />
                </Group>
            </Container>
        );
    }

    /* -------- assemble carousel media -------- */
    const eventMedia: Media[] = event.media || [];
    const locationMedia: Media[] = locationDetails?.media || [];
    const carouselItems = [...eventMedia, ...locationMedia];

    /* -------- accessibility needs -------- */
    const needs =
        locationDetails?.accessibility_features?.map((f: any) => ({
            icon: f.accessibility_need?.Icon,
            name: f.accessibility_need?.name,
        })) || [];

    /* -------- helper renderers -------- */
    const InfoRow = ({
                         icon,
                         label,
                     }: {
        icon: React.ReactNode;
        label: string | JSX.Element;
    }) => (
        <Group gap={6}>
            <ThemeIcon variant="subtle" size="sm">
                {icon}
            </ThemeIcon>
            <Text size="sm">{label}</Text>
        </Group>
    );

    const isLoggedIn = Boolean(localStorage.getItem('handicapp_jwt'));

    // @ts-ignore
    // @ts-ignore
    return (
        <Container size="lg" my="md">
            {/* ---- Carousel ---- */}
            {carouselItems.length > 0 && (
                <Carousel withIndicators height={400} mb="md">
                    {carouselItems.map((m, idx) => (
                        <Carousel.Slide key={idx}>
                            <Image
                                src={fullUrl(m.formats?.medium?.url || m.url)}
                                height={400}
                                fit="cover"
                            />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            )}

            {/* ---- Event name & description ---- */}
            <Title order={2} mb="xs">
                {event.name}
            </Title>
            <Text mb="md">{event.description}</Text>

            {/* ---- Accessibility icons ---- */}
            <Group gap="xs" mb="lg">
                {(locationDetails?.accessibility_features ?? []).map((f: any) => {
                    const icon = f.accessibility_need?.Icon;
                    const IconCmp = getMaterialIcon(icon);
                    return (
                        <Group key={f.id} gap={4}>
                            <ThemeIcon variant="light" radius="xl" size={36}>
                                <IconCmp fontSize="small" />
                            </ThemeIcon>
                            <Text size="sm">{f.name}</Text>
                        </Group>
                    );
                })}
            </Group>

            {/* ---- Info cards ---- */}
            <SimpleGrid
                cols={{ base: 1, md: 3 }}
                spacing="md"
            >
                {/* General info */}
                <Card withBorder radius="md" padding="md">
                    <Title order={4} mb="xs">
                        {t('General')}
                    </Title>
                    <Stack gap={6}>
                        <InfoRow icon={<MdCategory />} label={event.event_type} />
                        <InfoRow
                            icon={<MdCalendarToday />}
                            label={`${dayjs(event.start_time).format(
                                'DD MMM YYYY HH:mm',
                            )} – ${dayjs(event.end_time).format('DD MMM YYYY HH:mm')}`}
                        />
                        <InfoRow icon={<MdPeople />} label={`${event.max_capacity}`} />
                        {event.languages?.length && (
                            <InfoRow icon={<MdLanguage />} label={event.languages.join(', ')} />
                        )}
                        {event.website && (
                            <InfoRow icon={<MdWeb />} label={<a href={`https://${event.website}`}>{event.website}</a>} />
                        )}
                    </Stack>
                </Card>

                {/* Organizer */}
                <Card withBorder radius="md" padding="md">
                    <Title order={4} mb="xs">
                        {t('Organizer')}
                    </Title>
                    <Stack gap={6}>
                        {event.organizer?.media?.[0] && (
                            <Image
                                src={fullUrl(
                                    event.organizer.media[0].formats?.medium?.url ||
                                    event.organizer.media[0].url,
                                )}
                                height={80}
                                fit="contain"
                                radius="md"
                            />
                        )}
                        <InfoRow icon={<MdWork />} label={event.organizer?.name} />
                        <InfoRow icon={<MdCategory />} label={event.organizer?.type} />
                        {event.organizer?.website && (
                            <InfoRow
                                icon={<MdWeb />}
                                label={<a href={`https://${event.organizer.website}`}>{event.organizer.website}</a>}
                            />
                        )}
                        {event.organizer?.address && (
                            <InfoRow icon={<MdLocationOn />} label={event.organizer.address} />
                        )}
                        {event.organizer?.contact_email && (
                            <InfoRow icon={<MdMail />} label={event.organizer.contact_email} />
                        )}
                        {event.organizer?.contact_phone && (
                            <InfoRow icon={<MdPhone />} label={event.organizer.contact_phone} />
                        )}
                    </Stack>
                </Card>

                {/* Location */}
                <Card withBorder radius="md" padding="md">
                    <Title order={4} mb="xs">
                        {t('Location')}
                    </Title>
                    <Stack gap={6}>
                        <InfoRow icon={<MdLocationOn />} label={locationDetails?.name} />
                        {locationDetails?.address && (
                            <InfoRow icon={<MdLocationOn />} label={locationDetails.address} />
                        )}
                        {locationDetails?.location_overview && (
                            <InfoRow icon={<MdCategory />} label={locationDetails.location_overview} />
                        )}
                        {locationDetails?.contact_details && (
                            <InfoRow icon={<MdPhone />} label={locationDetails.contact_details} />
                        )}
                        {locationDetails?.opening_hours && (
                            <InfoRow icon={<MdSchedule />} label={locationDetails.opening_hours} />
                        )}
                        {locationDetails?.website && (
                            <InfoRow
                                icon={<MdWeb />}
                                label={<a href={`https://${locationDetails.website}`}>{locationDetails.website}</a>}
                            />
                        )}
                    </Stack>
                </Card>
            </SimpleGrid>
            {/* Book Tickets Button */}
            <Box
                pos="fixed"
                bottom={24}
                right={24}
                style={{
                    zIndex: 1100,
                }}
                w={{ base: '90vw', sm: 'auto' }}
                display="flex"
            >
                <Button
                    size="lg"
                    color="primary"
                    disabled={!isLoggedIn}
                    onClick={() => {
                        if (!isLoggedIn) return;
                    }}
                >
                    {t('Book')}
                </Button>
            </Box>

        </Container>
    );
}
