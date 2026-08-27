import { Group, useMatches } from '@mantine/core';
import React from 'react';
import { inputIconResources } from '../../icon/resources/input-icon-resources';
import { getControlIcon, inputIcon } from '../../interaction/controls/icons/get-control-icon';
import { useAllCurrentControls } from '../../interaction/controls/use-all-current-controls';
import { useControlsCurrentType } from '../../interaction/controls/use-controls-current-type';
import classes from './ui-footer.module.css';

export const UIFooter: React.FC = () => {
    // TODO perf issues (re-renders)
    const allControls = useAllCurrentControls();

    const controlsType = useControlsCurrentType();

    // console.log({ allControls: JSON.parse(JSON.stringify(allControls)) })

    const hidden = useMatches({
        base: controlsType === 'mouse',
        sm: false,
    });

    const controlsCount = Object.values(allControls).flatMap(controls => controls).length;

    const movingRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!movingRef.current)
            return;

        const el = movingRef.current;
        const parent = el.parentElement!;

        const elWidth = el.clientWidth;
        const parentWidth = parent.clientWidth;
        const diff = elWidth - parentWidth;

        if (diff > 0) {
            el.classList.add(classes.controls);
            el.style.setProperty('--width-diff', `${diff}px`);
        } else {
            el.style.removeProperty('--width-diff');
            el.classList.remove(classes.controls);
        }

    }, [ controlsCount ]);

    if (hidden)
        return null;

    return <Group
        className={classes.uiFooter}
        data-mantine-color-scheme="light"
        c='white'
        bg='primary.6'
        px='md'
        py='xs'
        gap='lg'
        wrap='nowrap'
    >
        {inputIcon(inputIconResources.type[ controlsType ])}

        <Group
            justify='flex-start'
            wrap='nowrap'
            style={{
                flexGrow: 1,
                overflow: 'hidden',
            }}
        >
            <Group
                ref={movingRef}
                justify='center'
                gap='lg'
                wrap='nowrap'
                mx='auto'
            >
                {Object.entries(allControls).map(([ controlId, controls ]) => <Group
                    key={controlId}
                    gap='lg'
                    wrap='nowrap'
                >
                    {controls.map(c => <Group key={c.name} gap='sm' wrap='nowrap' style={{ whiteSpace: 'nowrap' }}>
                        <Group gap='xs' wrap='nowrap'>
                            {getControlIcon(c.trigger.type, c.trigger.values, c.trigger.allowPressedSuite)}
                        </Group>
                        {c.label}
                    </Group>)}
                </Group>)}
            </Group>
        </Group>
    </Group>;
};
