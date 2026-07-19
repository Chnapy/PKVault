import { Anchor, Avatar, Card, Divider, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import { CircleUserRoundIcon, CodeXmlIcon, CopyrightIcon, MessagesSquareIcon } from 'lucide-react';
import type React from "react";
import { useTranslate } from '../../translate/i18n';
import { UIInputLabel } from '../../ui-new/form/ui-input-label';
import { LinkWithIcon } from '../../ui/link-with-icon/link-with-icon';

export const SettingsAboutLeft: React.FC = () => {
    const { t } = useTranslate();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<CodeXmlIcon />} label='Source code' />
                <LinkWithIcon href='https://github.com/Chnapy/PKVault' target='__blank'>
                    GitHub repository
                </LinkWithIcon>

                <UIInputLabel leftSection={<CircleUserRoundIcon />} label='Author' />
                <Group>
                    <Anchor href='https://github.com/Chnapy' target='__blank'>
                        <Group component='span' gap='sm'>
                            <Avatar src='https://avatars.githubusercontent.com/u/7474483?v=4' size='sm' />
                            Chnapy
                        </Group>
                    </Anchor>
                </Group>

                <UIInputLabel leftSection={<CopyrightIcon />} label='Licenses' />
                <Group>
                    <LinkWithIcon href='https://github.com/Chnapy/PKVault/blob/main/LICENSE' target='__blank'>
                        GPLv3
                    </LinkWithIcon>
                    -
                    <LinkWithIcon href='https://github.com/Chnapy/PKVault/blob/main/README.md#licenses' target='__blank'>
                        3rd-party
                    </LinkWithIcon>
                </Group>
            </SimpleGrid>
        </Card>

        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<MessagesSquareIcon />} label='Feedback & bug report' align='flex-start' />
                <Stack gap='sm'>
                    <LinkWithIcon href='https://github.com/Chnapy/PKVault/issues' target='__blank'>
                        GitHub issues
                    </LinkWithIcon>
                    <LinkWithIcon href='https://projectpokemon.org/home/forums/topic/67239-pkvault-centralized-pkm-storage-management-pokedex-app' target='__blank'>
                        Project Pokemon discussion
                    </LinkWithIcon>
                </Stack>
            </SimpleGrid>

            <Divider my='md' />

            <Text lh='sm'>
                PKVault is an open-source project.
                <br />You can contribute by giving feedbacks, bug reports, or with pull requests.
                <br />Thank you for using PKVault !
            </Text>
        </Card>
    </>;
};
