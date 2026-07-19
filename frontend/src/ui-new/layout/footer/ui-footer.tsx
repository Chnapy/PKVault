import { Group } from '@mantine/core';
import React from 'react';
import { inputIconResources } from '../../../ui/icon/input-icon-resources';
import { getControlIcon, inputIcon } from '../../interaction/controls/icons/get-control-icon';
import { useAllCurrentControls } from '../../interaction/controls/use-all-current-controls';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import classes from './ui-footer.module.css';

export const UIFooter: React.FC = () => {
    // TODO perf issues (re-renders)
    const allControls = useAllCurrentControls();

    const controlsType = useControlsCurrentType();

    // console.log({ allControls: JSON.parse(JSON.stringify(allControls)) })

    return <Group
        className={classes.uiFooter}
        data-mantine-color-scheme="light"
        c='white'
        bg='primary.6'
        px='md'
        py='xs'
        gap='lg'
    >
        {inputIcon(inputIconResources.type[ controlsType ])}

        <Group
            justify='center'
            gap='lg'
            style={{ flexGrow: 1 }}
        >
            {Object.entries(allControls).map(([ controlId, controls ]) => <Group
                key={controlId}
                gap='lg'
            >
                {controls.map(c => <Group key={c.name} gap='sm'>
                    <Group gap='xs'>
                        {getControlIcon(c.trigger.type, c.trigger.values, c.trigger.allowPressedSuite)}
                    </Group>
                    {c.label}
                </Group>)}
            </Group>)}
        </Group>
    </Group>;
};
