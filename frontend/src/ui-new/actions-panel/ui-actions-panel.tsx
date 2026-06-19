import { Button, Card, Divider, Drawer, Group, Indicator, OverflowList, Stack, Timeline, Title } from '@mantine/core';
import { SaveIcon, SortDescIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { DataActionType } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';
import { UIActionIcon } from '../form/button/ui-action-icon';
import { UIButton } from '../form/button/ui-button';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';
import { UIConfirmPopover } from '../popover/ui-confirm-popover';
import { useActionLabel } from './hooks/use-action-label';
import { UIAction, type UIActionProps } from './ui-action';
import { getActionColor } from './utils/get-action-color';

export type UIActionsPanelProps = {
    data: UIActionProps[];
    onDelete: (index: number) => Promise<unknown>;
    onSave: () => void;
};

export const UIActionsPanel: React.FC<UIActionsPanelProps> = ({ data, onDelete, onSave }) => {
    const { t } = useTranslate();
    const getLabel = useActionLabel();

    const [ opened, setOpened ] = React.useState(false);

    const { panelProps, nodeId, childScopeId, controlsIcons } = usePanelControls('actions');

    const hasActions = data.length > 0;

    const open = hasActions
        ? (() => setOpened(true))
        : undefined;
    const close = () => setOpened(false);

    return <>
        <WithControlsIcons placement='out' icons={controlsIcons.open} w='100%'>
            <Card
                orientation='horizontal'
                w='100%'
                p='sm'
                pl='md'
                {...panelProps}
            >
                <FocusScope id={childScopeId} parentNodeId={nodeId}>
                    <Group wrap='nowrap' style={{ flexGrow: 1 }}>
                        <Title order={5} lh={1}>Actions<br />to save</Title>

                        <Divider orientation='vertical' />

                        <OverflowList
                            data={data}
                            onClick={open}
                            display='flex'
                            gap='md'
                            style={{
                                flexGrow: 1,
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                cursor: 'pointer',
                            }}
                            renderItem={(props, i) => <UIAction key={i} {...props} />}
                            renderOverflow={(items) => <Button
                                size='compact-md'
                            >
                                + {items.length} actions
                            </Button>}
                        />

                        <Divider orientation='vertical' />

                        <Button
                            variant='filled'
                            color='primary'
                            size='compact-md'
                            pl='md'
                            pr='lg'
                            disabled={!hasActions}
                            leftSection={<SaveIcon />}
                            onClick={onSave}
                        >
                            {t('action.save')}
                        </Button>
                    </Group>
                </FocusScope>
            </Card>
        </WithControlsIcons>

        <Drawer
            opened={opened} onClose={close} position='right'
            title='12 actions to save'
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
        >
            <Stack h='100%' style={{ overflow: 'hidden' }}>
                <Timeline bulletSize={16} lineWidth={2} color='red' py='md' style={{
                    overflow: 'auto'
                }}>
                    {data.map(({ type }, i) => (
                        <Timeline.Item key={i}
                            title={<Group>
                                {getLabel(type)}

                                <Divider style={{ flexGrow: 1 }} />

                                <UIConfirmPopover
                                    label={'Delete'}
                                    description={'Delete this action and all next ones'}
                                    color='red'
                                    action={async () => {
                                        await onDelete(i);
                                        if (i === 0)
                                            close();
                                    }}
                                >
                                    <UIActionIcon
                                        variant='filled'
                                        color='red'
                                        p={0}
                                        name={`action-${i}`}
                                        controlLabel={`Action ${i}`}
                                        disabled={([
                                            DataActionType.DATA_NORMALIZE,
                                            DataActionType.UPDATE_EXTERNAL_PKM,
                                        ] as DataActionType[]).includes(type)}
                                        h='1rem'
                                        mt={-8}
                                    >
                                        <TrashIcon />
                                    </UIActionIcon>
                                </UIConfirmPopover>
                            </Group>}
                            bullet={<Indicator inline processing color={getActionColor(type)} />}
                        >
                        </Timeline.Item>
                    ))}
                </Timeline>
                <Group>
                    <SortDescIcon />
                    Most recent last
                </Group>

                <UIButton
                    name='actions-save'
                    controlLabel='Save actions'
                    variant='filled'
                    color='primary'
                    fullWidth
                    mt='auto'
                    disabled={!hasActions}
                    leftSection={<SaveIcon />}
                    onClick={onSave}
                >
                    {t('action.save')}
                </UIButton>
            </Stack>
        </Drawer>
    </>;
};
