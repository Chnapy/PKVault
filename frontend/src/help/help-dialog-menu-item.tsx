import { NavLink, Text } from '@mantine/core';
import type React from 'react';
import { Route } from '../routes/__root';
import { WithControlsIcons } from '../ui-new/interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../ui-new/interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../ui-new/interaction/focus-controls/use-focus-controls';

type HelpDialogMenuItemProps = {
    endPath: string;
    selected: boolean;
    title: string;
};

export const HelpDialogMenuItem: React.FC<HelpDialogMenuItemProps> = ({ endPath, selected, title }) => {
    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: endPath,
        // focusOnMount,
        controls: [
            getSelectControl({
                label: title,
            }),
        ],
    });

    return <WithControlsIcons placement='out' icons={controlIcons('open')}>
        <NavLink
            component={Route.Link}
            {...focusProps}
            {...controlProps('open') as object}
            to={'.'}
            search={{ help: endPath }}
            active={selected}
            variant="filled"
            label={<Text size='md'>
                {title}
            </Text>}
            bdrs='sm'
        />
    </WithControlsIcons>;
};
