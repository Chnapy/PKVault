import { inputIconResources } from '../../../../ui/icon/input-icon-resources';
import { UIIcon } from '../../../icon/ui-icon';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';
import type { ControlTriggerType, ControlTriggerValues } from '../provider/controls-context';

export const getControlIcon = <T extends ControlTriggerType>(trigger: T, values: ControlTriggerValues[ T ][]) => {
    // TODO
    switch (trigger) {
        case 'mouse':
            return null;
        case 'keyboard':
            return null;
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
                gpIcons.push(
                    <UIIcon src={inputIconResources.gamepad.DPad} />
                );
            }

            gpValues.forEach(value => {
                const gpIcon = inputIconResources.gamepad[ value as keyof typeof inputIconResources.gamepad ];
                if (gpIcon)
                    gpIcons.push(
                        <UIIcon src={gpIcon} />
                    );
            });

            return gpIcons;
        }
    }
};
