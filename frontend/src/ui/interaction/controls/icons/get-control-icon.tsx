import { HandIcon } from 'lucide-react';
import { inputIconResources } from '../../../icon/resources/input-icon-resources';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';
import type { ControlTriggerType, ControlTriggerValues, MouseMappings } from '../provider/controls-context';
import { ControlIcon } from './control-icon';

export const getControlIcon = <T extends ControlTriggerType>(trigger: T, values: ControlTriggerValues[ T ][], allowPressedSuite: number = 0) => {
    if (values.length === 0) return [];

    const keepPressed = allowPressedSuite > 1;

    switch (trigger) {
        case 'mouse':
            return (values as MouseMappings[]).map((value, i) => {
                switch (value) {
                    case 'left-click': return <ControlIcon key={i} rawSvg={inputIconResources.mouse.leftClick} />;
                    case 'right-click': return <ControlIcon key={i} rawSvg={inputIconResources.mouse.rightClick} />;
                    case 'move': return <ControlIcon key={i} rawSvg={inputIconResources.mouse.move} />;
                    case 'drag': return <HandIcon key={i} />;
                    case 'scroll': return <ControlIcon key={i} rawSvg={inputIconResources.mouse.scroll} />;
                }
            }).filter(Boolean);
        case 'keyboard': {
            const kbValues = new Set([ ...values ] as string[]);
            const kbIcons = [];

            const arrows = kbValues.has('ArrowDown')
                && kbValues.has('ArrowUp')
                && kbValues.has('ArrowLeft')
                && kbValues.has('ArrowRight');

            if (arrows) {
                kbValues.delete('ArrowDown');
                kbValues.delete('ArrowUp');
                kbValues.delete('ArrowLeft');
                kbValues.delete('ArrowRight');
                kbIcons.push(inputIconResources.keyboard.arrows);
            }

            [ ...kbValues ].map(value => {
                switch (value) {
                    case 'Escape': return inputIconResources.keyboard.escape;
                    case 'Space': return inputIconResources.keyboard.space;
                    case 'KeyX': return inputIconResources.keyboard.x;
                }
            })
                .forEach(icon => icon && kbIcons.push(icon));

            return [ ...kbIcons ].map((icon, i) => <ControlIcon key={i} rawSvg={icon} />);
        }
        case 'gamepad': {
            const gpValues = new Set([ ...values ] as GamepadMappingsAllButton[]);
            const gpIcons = [];

            const dpad = gpValues.has('DPadDown')
                && gpValues.has('DPadUp')
                && gpValues.has('DPadLeft')
                && gpValues.has('DPadRight');

            if (dpad) {
                gpValues.delete('DPadDown');
                gpValues.delete('DPadUp');
                gpValues.delete('DPadLeft');
                gpValues.delete('DPadRight');
                gpIcons.push(inputIconResources.gamepad.DPad);
            }

            const rStick = gpValues.has('RStickDown')
                && gpValues.has('RStickUp')
                && gpValues.has('RStickLeft')
                && gpValues.has('RStickRight');

            if (rStick) {
                gpValues.delete('RStickDown');
                gpValues.delete('RStickUp');
                gpValues.delete('RStickLeft');
                gpValues.delete('RStickRight');
                gpIcons.push(inputIconResources.gamepad.RStick);
            }

            gpValues.forEach(value => {
                const gpIcon = inputIconResources.gamepad[ value as keyof typeof inputIconResources.gamepad ];
                if (gpIcon)
                    gpIcons.push(gpIcon);
            });

            return gpIcons.map((icon, i) => <ControlIcon key={i} rawSvg={icon} />).map((icon, i) => keepPressed
                ? <div key={i} style={{ display: 'flex', position: 'relative' }}>
                    {icon}

                    <ControlIcon rawSvg={inputIconResources.misc.keepPress} style={{
                        position: 'absolute',
                        color: 'var(--mantine-color-gray-4)',
                    }} />
                </div>
                : icon).filter(Boolean);
        }
    }
};
