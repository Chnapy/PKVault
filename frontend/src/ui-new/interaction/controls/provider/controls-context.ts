import React from 'react';
import { create } from 'zustand';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';

export type ControlTriggerValues = {
    mouse: 'move' | 'drag' | 'left-click' | 'right-click' | 'middle-click' | 'scroll';
    keyboard: string;//'a' | 'b' | 'Enter' | 'Backspace' | 'Space';
    gamepad: GamepadMappingsAllButton;
};

export type ControlTriggerType = keyof ControlTriggerValues;

export type ControlTrigger<T extends ControlTriggerType = ControlTriggerType> = {
    type: T;
    values: ControlTriggerValues[T][];
    allowPressedSuite?: boolean;
};

export type ControlAction = {
    name: string;
    triggers: { [trigger in ControlTriggerType]?: ControlTrigger<trigger> };
    label: string;
    focused: boolean;
    // spread to children, if not overriden by them
    spread: boolean;
    // override lowest order, for same trigger values only
    order: number;
    action: <T extends ControlTriggerType = ControlTriggerType>(e: Event | React.BaseSyntheticEvent , trigger: T, value: ControlTriggerValues[T]) => void;
};

export type ControlActionInput = Omit<ControlAction, 'focused' | 'order'>;

type Falsy = false | undefined | null | '' | 0; 

export type ControlsWithFalsy = (ControlActionInput | Falsy)[];
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

export const createControlsStore = () => create<ControlsStore>()((set) => ({
    controls: new Map(),
    currentType: 'mouse',

    registerControls: (id: ControlId, controlItems: Controls) => set(s => {
        const controls = new Map(s.controls);
        controls.set(id, controlItems);

        return {
            ...s,
            controls,
        };
    }),
    unregisterControls: (id: ControlId) => set(s => {
        if (!s.controls.has(id))
            return s;

        const controls = new Map(s.controls);
        controls.delete(id);

        return {
            ...s,
            controls,
        };
    }),
}));
