import { Card, Group, Modal, Text } from '@mantine/core';
import { InfoIcon } from 'lucide-react';
import React from 'react';
import { Route } from '../routes/__root';
import { useTranslate } from '../translate/i18n';
import { useControls } from '../ui-new/interaction/controls/use-controls';
import { getBackControl } from '../ui-new/interaction/focus-controls/common-controls/back-controls';
import { FocusScope } from '../ui-new/interaction/focus/scope/focus-scope';
import { useFocusScopeContext } from '../ui-new/interaction/focus/scope/use-focus-scope-context';
import { HelpDialogContent } from './help-dialog-content';
import { HelpDialogMenu } from './help-dialog-menu';
import classes from './help-dialog.module.css';
import { useHelpMenuItems } from './hooks/use-help-menu-items';
import { useHelpNavigate } from './hooks/use-help-navigate';

export const HelpDialog: React.FC = () => {
    const { t } = useTranslate();

    const opened = Route.useSearch({ select: search => !!search.help });
    const helpNavigate = useHelpNavigate();

    const onClose = () => helpNavigate(undefined);

    return (
        <Modal
            opened={opened}
            keepMounted={false}
            onClose={onClose}
            size='xl'
            title={<Group gap='sm'>
                <InfoIcon />
                <Text size='xl'>
                    {t('header.help')}
                </Text>
            </Group>}
            classNames={{
                content: classes.helpDialogInnerContent,
                body: classes.helpDialogInnerBody,
            }}
        >
            <HelpDialogInner />
        </Modal>
    );
};

const HelpDialogInner: React.FC = () => {
    const helpPathFallback = React.useRef('');
    const helpPath = Route.useSearch({ select: search => search.help ?? helpPathFallback.current });
    const helpNavigate = useHelpNavigate();

    // when dialog is closing,
    // avoid redirect to first page
    React.useEffect(() => {
        if (helpPath)
            helpPathFallback.current = helpPath;
    }, [ helpPath ]);

    const [ helpHash, helpAnchor ] = helpPath.split('#');

    const { language, menuItems } = useHelpMenuItems();

    const onClose = () => helpNavigate(undefined);

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const { controlProps } = useControls(
        'help-dialog',
        true,
        order + 1,
        [
            getBackControl({
                label: 'Back',
                action: onClose,
            }),
        ],
        { enabled: true },
    );

    const menuItem = menuItems.find(item => item.endPath === helpHash) ?? menuItems[ 0 ]!;

    const selectedEndPath = menuItem.endPath;

    const finalSelectedPath = `/docs/${language}/${selectedEndPath}`;

    return <FocusScope id='help-dialog' focusOnMount>
        <div
            {...controlProps('back')}
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
    </FocusScope>;
};
