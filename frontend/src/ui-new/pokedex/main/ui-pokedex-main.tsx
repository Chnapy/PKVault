import { Card } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';

type UIPokedexMainProps = {
    children: React.ReactNode;
} & Card.Props;

export const UIPokedexMain: React.FC<UIPokedexMainProps> = ({ children, ...rest }) => {
    const name = 'pokedex-main';
    const childScopeId = name;

    const isInScopeStack = Focus.useIsInScopeStack(childScopeId);

    const { pushScope } = Focus.usePushPopScope();

    const { focusProps, nodeId, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        childScopeId,
        controls: [
            !isInScopeStack && getSelectControl({
                label: 'Select',
                action: () => pushScope(childScopeId),
            }),
        ],
    });

    return <FocusScope id={name} parentNodeId={nodeId}>
        <WithControlsIcons
            placement='out' icons={controlIcons('open')}
            {...focusProps}
            {...controlProps('open')}
            {...rest}
        >
            <Card mah='100%' style={{
                flexGrow: 1,
                overflow: 'auto',
            }}>
                {children}
            </Card>
        </WithControlsIcons>
    </FocusScope>;
};
