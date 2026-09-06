import { Card } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';
import { getScrollPadding } from '../../scrollbar-width/util/get-scroll-padding';

type UIPokedexMainProps = {
    children: React.ReactNode;
} & Card.Props;

export const UIPokedexMain: React.FC<UIPokedexMainProps> = ({ children, ...rest }) => {
    const { t } = useTranslate();

    const name = 'pokedex-main';
    const childScopeId = name;

    const isInScopeStack = Focus.useIsInScopeStack(childScopeId);

    const { pushScope } = Focus.usePushPopScope();

    const { focusProps, nodeId, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        childScopeId,
        controls: [
            !isInScopeStack && getSelectControl({
                label: t('action.select'),
                action: () => pushScope(childScopeId),
            }),
        ],
    });

    const isMouseControls = useControlsCurrentType() === 'mouse';

    return <FocusScope
        id={name}
        parentNodeId={nodeId}
        // fix scroll issue with mouse controls: scroll reset on click when no item selected
        restoreMode={isMouseControls ? 'none' : undefined}
    >
        <WithControlsIcons placement='out' icons={controlIcons('open')}
            {...rest}
        >
            <Card mah='100%' pr={getScrollPadding('md')} style={{
                flexGrow: 1,
                overflowY: 'auto',
                scrollbarGutter: 'stable',
            }}
                {...focusProps}
                {...controlProps('open')}>
                {children}
            </Card>
        </WithControlsIcons>
    </FocusScope>;
};
