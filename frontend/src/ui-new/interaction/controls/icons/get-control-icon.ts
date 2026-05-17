import type { ControlTriggerType, ControlTriggerValues } from '../provider/controls-context';

export const getControlIcon = <T extends ControlTriggerType>(trigger: T, value: ControlTriggerValues[T]) => {
    // TODO create an icon component for each trigger
    switch(trigger) {
        case 'mouse':
            switch(value) {
                default: return 'TMP-M';
            }
        case 'keyboard':
            switch(value) {
                default: return 'TMP-K';
            }
        case 'gamepad':
            switch(value) {
                default: return 'TMP-G';
            }
    }
};
