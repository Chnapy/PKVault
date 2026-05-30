import { HandIcon } from 'lucide-react';
import { inputIconResources, type InputIcon } from '../../../../ui/icon/input-icon-resources';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';
import type { ControlTriggerType, ControlTriggerValues, MouseMappings } from '../provider/controls-context';
import classes from './control-icon.module.css';

const inputIcon = (Icon: InputIcon, i?: number, props?: React.SVGProps<SVGSVGElement>) => <Icon key={i} viewBox="0 0 64 64" className={classes.controlIcon} {...props} />;

export const getControlIcon = <T extends ControlTriggerType>(trigger: T, values: ControlTriggerValues[ T ][], allowPressedSuite: number = 0) => {
    if (values.length === 0) return [];

    const keepPressed = allowPressedSuite > 1;

    // TODO
    switch (trigger) {
        case 'mouse':
            return (values as MouseMappings[]).map((value, i) => {
                switch (value) {
                    case 'left-click': return inputIcon(inputIconResources.mouse.leftClick, i);
                    case 'right-click': return inputIcon(inputIconResources.mouse.rightClick, i);
                    case 'move': return inputIcon(inputIconResources.mouse.move, i);
                    case 'drag': return <HandIcon key={i} />;
                }
            }).filter(Boolean);
        case 'keyboard':
            return [];
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

            gpValues.forEach(value => {
                const gpIcon = inputIconResources.gamepad[ value as keyof typeof inputIconResources.gamepad ];
                if (gpIcon)
                    gpIcons.push(gpIcon);
            });

            return gpIcons.map((icon, i) => inputIcon(icon, i)).map((icon, i) => keepPressed
                ? <div key={i} style={{ display: 'flex', position: 'relative' }}>
                    {icon}

                    {inputIcon(inputIconResources.misc.keepPress, undefined, {
                        style: {
                            position: 'absolute',
                            color: 'var(--mantine-color-gray-4)',
                        }
                    })}
                </div>
                : icon).filter(Boolean)
        }
    }
};
