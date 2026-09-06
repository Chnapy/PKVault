import React from 'react';
import { create } from 'zustand';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';

export type MouseMappings = 'move' | 'drag' | 'left-click' | 'right-click' | 'middle-click' | 'scroll';

export type ControlTriggerValues = {
    mouse: MouseMappings;
    keyboard: string;//'a' | 'b' | 'Enter' | 'Backspace' | 'Space';
    gamepad: GamepadMappingsAllButton;
};

export type ControlTriggerType = keyof ControlTriggerValues;

export type ControlListenerName = Extract<keyof React.DOMAttributes<never>, `on${string}`>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ControlListenerAttributes = Pick<React.DOMAttributes<any>, ControlListenerName>;

export type ControlTrigger<T extends ControlTriggerType = ControlTriggerType> = {
    type: T;
    values: ControlTriggerValues[ T ][];
    allowPressedSuite?: number;
    allowOnFocus?: boolean;
    listeners?: ControlListenerName[];
};

export type ControlAction<N extends string = string> = {
    name: N;
    triggers: { [ trigger in ControlTriggerType ]?: ControlTrigger<trigger> };
    label: string;
    focused: boolean;
    // spread to children, if not overridden by them
    spread: boolean;
    // override lowest order, for same trigger values only
    order: number;
    main?: boolean;
    ref?: React.RefObject<Pick<HTMLButtonElement, 'click'>>;
    action?: <T extends ControlTriggerType = ControlTriggerType>(e: never, trigger: T, value: ControlTriggerValues[ T ]) => void;
};

export type ControlActionInput<N extends string = string> = Omit<ControlAction<N>, 'focused' | 'order'>;

type Falsy = false | undefined | null | '' | 0;

export type ControlsWithFalsy<N extends string = string> = (ControlActionInput<N> | Falsy)[];
export type Controls = ControlAction[];

export type ControlId = string;

export type ControlsContext = {
    useControlsStore: ReturnType<typeof createControlsStore>;
};

export const controlsContext = React.createContext<ControlsContext | null>(null);

type ControlsStore = {
    controls: Map<ControlId, Controls>;
    currentType: ControlTriggerType;
    registerControls: (id: ControlId, controls: Controls) => void;
    unregisterControls: (id: ControlId) => void;
};

export const createControlsStore = (currentType?: ControlTriggerType) => create<ControlsStore>()((set) => ({
    controls: new Map(),
    currentType: currentType ?? 'mouse',

    registerControls: (id: ControlId, controlItems: Controls) => set(s => {
        const controls = new Map(s.controls);
        controls.set(id, controlItems);

        // console.log('REGISTER', id, controlItems)

        return {
            ...s,
            controls,
        };
    }),
    unregisterControls: (id: ControlId) => set(s => {
        if (!s.controls.has(id))
            return s;

        // console.log('UNREGISTER', id, s.controls.get(id))
        const controls = new Map(s.controls);
        controls.delete(id);

        return {
            ...s,
            controls,
        };
    }),
}));
