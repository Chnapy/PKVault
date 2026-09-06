import { Anchor, Avatar, Card, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { CircleUserRoundIcon, CodeXmlIcon, CopyrightIcon, MessagesSquareIcon } from 'lucide-react';
import type React from "react";
import { useTranslate } from '../../translate/i18n';
import { UIInputLabel } from '../../ui/form/ui-input-label';
import { UILinkWithIcon } from '../../ui/link-with-icon/ui-link-with-icon';

export const SettingsAboutLeft: React.FC = () => {
    const { t } = useTranslate();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<CodeXmlIcon />} label={t('settings.about.1.label')} />
                <UILinkWithIcon href='https://github.com/Chnapy/PKVault' target='__blank'>
                    {t('settings.about.1.description')}
                </UILinkWithIcon>

                <UIInputLabel leftSection={<CircleUserRoundIcon />} label={t('settings.about.2.label')} />
                <Group>
                    <Anchor href='https://github.com/Chnapy' target='__blank'>
                        <Group component='span' gap='sm'>
                            <Avatar src='https://avatars.githubusercontent.com/u/7474483?v=4' size='sm' />
                            Chnapy
                        </Group>
                    </Anchor>
                </Group>

                <UIInputLabel leftSection={<CopyrightIcon />} label={t('settings.about.3.label')} />
                <Group>
                    <UILinkWithIcon href='https://github.com/Chnapy/PKVault/blob/main/LICENSE' target='__blank'>
                        GPLv3
                    </UILinkWithIcon>
                    -
                    <UILinkWithIcon href='https://github.com/Chnapy/PKVault/blob/main/README.md#licenses' target='__blank'>
                        {t('settings.about.3.description')}
                    </UILinkWithIcon>
                </Group>
            </SimpleGrid>
        </Card>

        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<MessagesSquareIcon />} label={t('settings.about.4.label')} align='flex-start' />
                <Stack gap='sm'>
                    <UILinkWithIcon href='https://github.com/Chnapy/PKVault/issues' target='__blank'>
                        {t('settings.about.4.description.1')}
                    </UILinkWithIcon>
                    <UILinkWithIcon href='https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app' target='__blank'>
                        {t('settings.about.4.description.2')}
                    </UILinkWithIcon>
                </Stack>
            </SimpleGrid>

            <Divider my='md' />

            <Text lh='sm'>
                {t('settings.about.5.description.1')}
                <br />{t('settings.about.5.description.2')}
                <br />{t('settings.about.5.description.3')}
            </Text>
        </Card>
    </>;
};
