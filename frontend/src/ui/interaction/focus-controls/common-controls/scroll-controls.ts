import { getCurrentFocusKey, SpatialNavigation } from '@noriginmedia/norigin-spatial-navigation-core';
import type { GamepadMappingsAllButton } from '../../controls/gamepad/gamepad-mapper';
import type { ControlActionInput } from '../../controls/provider/controls-context';

export const getScrollControl = (partial: Pick<ControlActionInput, 'label'>) => ({
    ...partial,
    name: 'scroll' as const,
    triggers: {
        mouse: {
            type: 'mouse',
            values: [ 'scroll' ],
        },
        // keyboard: {
        //     type: 'keyboard',
        //     values: [  ],
        // },
        gamepad: {
            type: 'gamepad',
            values: [ 'RStickLeft', 'RStickRight', 'RStickUp', 'RStickDown' ],
        },
    },
    spread: true,
    action: (e, trigger, value) => {
        const currentKey = getCurrentFocusKey() ?? '';
        const node: HTMLElement | null = SpatialNavigation.getNodeLayoutByFocusKey(currentKey)?.node;
        if (!node)
            return;

        const vertical = value === 'RStickUp' || value === 'RStickDown';

        const getParentScrollable = (el: HTMLElement) => {
            if (!el.parentElement)
                return;

            if (vertical) {
                if (el.parentElement.scrollHeight - el.parentElement.clientHeight > 100)
                    return el.parentElement;
            } else {
                if (el.parentElement.scrollWidth - el.parentElement.clientWidth > 100)
                    return el.parentElement;
            }

            return getParentScrollable(el.parentElement);
        };

        const scrollableElement = getParentScrollable(node);
        if (!scrollableElement)
            return;

        switch(value as GamepadMappingsAllButton) {
            case 'RStickUp':
                scrollableElement.scrollBy({
                    behavior: 'smooth',
                    top: -scrollableElement.clientHeight / 2,
                });
                break;
            case 'RStickDown':
                scrollableElement.scrollBy({
                    behavior: 'smooth',
                    top: scrollableElement.clientHeight / 2,
                });
                break;
            case 'RStickLeft':
                scrollableElement.scrollBy({
                    behavior: 'smooth',
                    left: -scrollableElement.clientWidth / 2,
                });
                break;
            case 'RStickRight':
                scrollableElement.scrollBy({
                    behavior: 'smooth',
                    left: scrollableElement.clientWidth / 2,
                });
                break;
        }
    },
} satisfies ControlActionInput);
