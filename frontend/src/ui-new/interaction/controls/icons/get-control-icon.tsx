import { HandIcon } from 'lucide-react';
import { inputIconResources, type InputIcon } from '../../../../ui/icon/input-icon-resources';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';
import type { ControlTriggerType, ControlTriggerValues, MouseMappings } from '../provider/controls-context';
import classes from './control-icon.module.css';

const inputIcon = (Icon: InputIcon, i?: number) => <Icon key={i} viewBox="0 0 64 64" className={classes.controlIcon} />;

export const getControlIcon = <T extends ControlTriggerType>(trigger: T, values: ControlTriggerValues[ T ][]) => {
    // TODO
    switch (trigger) {
        case 'mouse':
            return (values as MouseMappings[]).map((value, i) => {
                switch (value) {
                    case 'left-click': return inputIcon(inputIconResources.mouse.leftClick, i);
                    case 'right-click': return inputIcon(inputIconResources.mouse.rightClick, i);
                    case 'move': return inputIcon(inputIconResources.mouse.move, i);
                    case 'drag': return <HandIcon />;
                }
            });
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

            return gpIcons.map(inputIcon);
        }
    }
};
