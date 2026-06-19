import { Card, Modal, Text } from '@mantine/core';
import React from 'react';
import { Route } from '../routes/__root';
import { useTranslate } from '../translate/i18n';
import { HelpDialogContent } from './help-dialog-content';
import { HelpDialogMenu } from './help-dialog-menu';
import { useHelpMenuItems } from './hooks/use-help-menu-items';
import { useHelpNavigate } from './hooks/use-help-navigate';

export const HelpDialog: React.FC = () => {
    const { t } = useTranslate();

    const helpPath = Route.useSearch({ select: search => search.help ?? '' });
    const helpNavigate = useHelpNavigate();

    const [ helpHash, helpAnchor ] = helpPath.split('#');

    const { language, menuItems } = useHelpMenuItems();

    const menuItem = menuItems.find(item => item.endPath === helpHash) ?? menuItems[ 0 ]!;

    const selectedEndPath = menuItem.endPath;

    const finalSelectedPath = `/docs/${language}/${selectedEndPath}`;

    const onClose = () => helpNavigate(undefined);

    return (
        <Modal
            opened={!!helpPath}
            onClose={onClose}
            size='xl'
            title={<Text size='xl'>
                {t('header.help')}
            </Text>}
            styles={{
                content: {
                    display: 'flex',
                    flexDirection: 'column',
                    '--mantine-color-body': 'var(--mantine-color-white-5)',
                },
                body: {
                    position: 'relative',
                    flexGrow: 1,
                    overflow: 'auto',
                },
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    height: '100%',
                    gap: 8,
                }}
            >
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        flexShrink: 0,
                        width: 200,
                    }}
                >
                    <HelpDialogMenu
                        finalSelectedPath={finalSelectedPath}
                    />
                </div>

                <Card h='stretch' style={{ flexGrow: 1 }}>
                    <HelpDialogContent
                        selectedEndPath={selectedEndPath}
                        finalSelectedPath={finalSelectedPath}
                        anchor={helpAnchor}
                        slugs={[ ...menuItem.slugs ]}
                    />
                </Card>
            </div>
        </Modal>
    );
};
