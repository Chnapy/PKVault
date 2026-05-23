import { Group } from '@mantine/core';
import type React from 'react';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../../layout/hooks/use-panel-controls';
import { CurrentPanelProvider } from './context/ui-current-panel-provider';
import { PanelProvider } from './context/ui-panel-context';

type UIStorageContentProps = {
    id?: string;
    left: React.ReactNode;
    right: React.ReactNode;
};

export const UIStorageContent: React.FC<UIStorageContentProps> = ({ id, left, right }) => {

    const { panelProps, nodeId, childScopeId } = usePanelControls('storage-content', {
        focusOnMount: true,
    });

    return <Group
        id={id}
        grow
        wrap='nowrap'
        align='stretch'
        mih={0}
        bdrs='md'
        {...panelProps}
        style={{
            flexGrow: 1,
        }}
    >
        <FocusScope id={childScopeId} parentNodeId={nodeId}>
            <CurrentPanelProvider initialValue='left'>
                <PanelProvider value='left'>
                    {left}
                </PanelProvider>
                {/* {middle} */}
                <PanelProvider value='right'>
                    {right}
                </PanelProvider>
            </CurrentPanelProvider>
        </FocusScope>
    </Group>;
};
