import type React from 'react';
import { WithControlsIcons } from '../interaction/controls/icons/with-controls-icons';
import { FocusScope } from '../interaction/focus/scope/focus-scope';
import { usePanelControls } from '../layout/hooks/use-panel-controls';

type UISavesContentProps = {
    children: React.ReactNode;
};

export const UISavesContent: React.FC<UISavesContentProps> = ({ children }) => {
    const { panelProps, nodeId, childScopeId, controlIcons } = usePanelControls('saves-content', {
        // focusOnMount: true,
    });

    return <FocusScope id={childScopeId} parentNodeId={nodeId}>
        <WithControlsIcons placement='out' icons={controlIcons('open')}
            display='flex'
            mah='100%'
            bdrs='md'
            style={{ flexGrow: 1, flexDirection: 'column', flexWrap: 'nowrap', }}
            {...panelProps}
        >
            {children}
        </WithControlsIcons>
    </FocusScope>;
};
