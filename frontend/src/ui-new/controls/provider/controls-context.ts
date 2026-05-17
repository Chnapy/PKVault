import React from 'react';
import type { GamepadMappingsAllButton } from '../gamepad/gamepad-mapper';

type ControlTriggerValues = {
    mouse: 'move' | 'left-click' | 'right-click' | 'middle-click' | 'scroll';
    keyboard: string;//'a' | 'b' | 'Enter' | 'Backspace' | 'Space';
    gamepad: GamepadMappingsAllButton;
};

export type ControlTriggerType = keyof ControlTriggerValues;

export type ControlTrigger<T extends ControlTriggerType> = {
    type: T;
    values: ControlTriggerValues[T][];
    icon: React.ReactNode;
    allowPressedSuite?: boolean;
};

export type ControlAction = {
    name: string;
    triggers: { [trigger in ControlTriggerType]?: ControlTrigger<trigger> };
    label: string;
    action: <T extends ControlTriggerType>(trigger: T, value: ControlTriggerValues[T]) => void;
};

type Falsy = false | undefined | null | '' | 0; 

export type ControlsWithFalsy = (ControlAction | Falsy)[];
export type Controls = ControlAction[];

export type ControlId = string;

export type ControlsContext = {
    controlsRef: React.RefObject<Map<ControlId, Controls>>;
    controlsState: React.RefObject<ControlTriggerType>;
    controlsListeners: React.RefObject<Set<(id?: ControlId) => void>>;
    registerControls: (id: ControlId, controls: Controls) => void;
    unregisterControls: (id: ControlId) => void;
};

export const controlsContext = React.createContext<ControlsContext | null>(null);
