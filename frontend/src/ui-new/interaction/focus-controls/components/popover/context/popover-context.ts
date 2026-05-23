import React from 'react';
import { create } from 'zustand';

export type PopoverContext = {
    usePopoverStore: ReturnType<typeof createPopoverStore>;
};

export const popoverContext = React.createContext<PopoverContext | null>(null);

export type PopoverStore = {
    opened: boolean;
};

export const createPopoverStore = () => create<PopoverStore>()(() => ({
    opened: false,
}));
