import { Button, Card, Divider, Group, OverflowList, Text, Title } from '@mantine/core';
import { SaveIcon, SortDescIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../form/button/ui-button';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../interaction/focus-controls/common-controls/select-controls';
import { DrawerWithControls } from '../interaction/focus-controls/components/popover/drawer-with-controls';
import { useFocusControls } from '../interaction/focus-controls/use-focus-controls';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';
import { UIActionsDrawerContent, type UIActionsDrawerContentProps } from './drawer/ui-actions-drawer-content';
import { UIAction } from './ui-action';

export type UIActionsPanelProps = UIActionsDrawerContentProps;

export const UIActionsPanel: React.FC<UIActionsPanelProps> = ({ data, onDelete, onSave }) => {
    const { panelProps, nodeId, childScopeId, controlIcons } = usePanelControls('actions');

    return <WithControlsIcons placement='out' icons={controlIcons('open')} w='100%'>
        <Card
            orientation='horizontal'
            w='100%'
            p='sm'
            pl='md'
            {...panelProps}
        >
            <FocusScope id={childScopeId} parentNodeId={nodeId}>
                <UIActionsPanelContent
                    data={data}
                    onDelete={onDelete}
                    onSave={onSave}
                />
            </FocusScope>
        </Card>
    </WithControlsIcons>;
};

const UIActionsPanelContent: React.FC<UIActionsPanelProps> = ({ data, onDelete, onSave }) => {
    const { t } = useTranslate();

    const hasActions = data.length > 0;

    const [ opened, setOpened ] = React.useState(false);

    const onSaveAndClose = hasActions && onSave
        ? (async () => {
            await onSave();
            setOpened(false);
        })
        : undefined;

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: 'actions-panel',
        controls: [
            hasActions && getSelectControl({
                label: 'See all actions',
                action: () => {
                    setOpened(true);
                },
            }),
            onSaveAndClose && {
                name: 'save',
                label: 'Save',
                spread: false,
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    },
                },
                action: () => {
                    return onSaveAndClose();
                },
            },
        ],
    });

    const reversedData = data.reverse();

    return <Group wrap='nowrap' style={{ flexGrow: 1 }}>
        <Title order={5} lh={1}>{t('storage.save-actions.title')}</Title>

        <Divider orientation='vertical' />

        <DrawerWithControls
            opened={opened}
            setOpened={setOpened}
            position='right'
            title={<>
                <Group>
                    <SaveIcon />
                    <Text size='lg'>
                        {t('storage.save-actions.drawer.title', { count: data.length })}
                    </Text>
                </Group>
                <Text component='div' c='dimmed' lh={1.1}>
                    <Group>
                        <SortDescIcon />
                        {t('storage.save-actions.drawer.sort')}
                    </Group>
                </Text>
            </>}
            closeButtonProps={{ style: { alignSelf: 'flex-start' } }}
            styles={{
                content: {
                    display: 'flex',
                    flexDirection: 'column',
                },
                body: {
                    flexGrow: 1,
                    overflow: 'hidden',
                },
            }}
            target={<WithControlsIcons
                placement='out' icons={controlIcons('open')}
                style={{ flexGrow: 1 }}
            >
                <OverflowList
                    data={reversedData}
                    {...focusProps}
                    {...controlProps('open')}
                    display='flex'
                    gap='md'
                    mih={26}
                    bdrs='xl'
                    style={{
                        flexGrow: 1,
                        alignItems: 'center',
                        cursor: data.length > 0 ? 'pointer' : undefined,
                    }}
                    renderItem={(props, i) => <UIAction key={i} {...props} />}
                    renderOverflow={(items) => <Button
                        size='compact-md'
                    >
                        {t('storage.save-actions.extra.label', { count: items.length })}
                    </Button>}
                />
            </WithControlsIcons>}
            dropdown={<UIActionsDrawerContent
                data={reversedData}
                onDelete={onDelete}
                onSave={onSaveAndClose}
            />}
        />

        <Divider orientation='vertical' />

        <UIButton
            name='save-2'
            controlLabel='Save'
            controlIcons={[ controlIcons('save') ]}
            variant='filled'
            color='primary'
            size='compact-md'
            pl='md'
            pr='lg'
            leftSection={<SaveIcon />}
            onClick={onSaveAndClose}
            disabled={!hasActions}
        >
            {t('action.save')}
        </UIButton>
    </Group>;
};
