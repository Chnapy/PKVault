import { Card, Stack, Title } from '@mantine/core';
import type React from 'react';
import { WithControlsIcons, type WithControlsIconsExtraProps } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import { FocusScope } from '../../interaction/focus/scope/focus-scope';

type UIPokedexFiltersProps = {
    views: React.ReactNode;
    children: React.ReactNode;
} & WithControlsIconsExtraProps;

export const UIPokedexFilters: React.FC<UIPokedexFiltersProps> = ({ views, children, ...rest }) => {
    const name = 'pokedex-filters';
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
        <WithControlsIcons placement='out' icons={controlIcons('open')} {...rest}>
            <Card {...focusProps} {...controlProps('open')} w='100%' mah='100%'>
                <Card.Section withBorder inheritPadding pt='sm' pb='inherit'>
                    <Stack>
                        <Title order={5} ta='center'>Views</Title>

                        {views}
                    </Stack>
                </Card.Section>
                <Card.Section withBorder inheritPadding pt='sm' pb='inherit'>
                    <Title order={5} ta='center'>Filters</Title>

                    <Stack>
                        {children}
                    </Stack>
                </Card.Section>
            </Card>
        </WithControlsIcons>
    </FocusScope>;
};
