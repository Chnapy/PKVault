import { Button, Card, Divider, Group, OverflowList, Title } from '@mantine/core';
import { SaveIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';
import { UIAction, type UIActionProps } from './ui-action';

export type UIActionsPanelProps = {
    data: UIActionProps[];
    onSave: () => void;
};

export const UIActionsPanel: React.FC<UIActionsPanelProps> = ({ data, onSave }) => {
    const { t } = useTranslate();

    const { panelProps, nodeId, childScopeId, controlsIcons } = usePanelControls('actions');

    return <WithControlsIcons placement='out' icons={controlsIcons.open} w='100%'>
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

                    <Divider orientation='vertical' mr='auto' />

                    <OverflowList
                        data={data}
                        display='flex'
                        gap='md'
                        style={{ alignItems: 'center' }}
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
                        disabled={data.length === 0}
                        leftSection={<SaveIcon />}
                        onClick={onSave}
                    >
                        {t('action.save')}
                    </Button>
                </Group>
            </FocusScope>
        </Card>
    </WithControlsIcons>
};
