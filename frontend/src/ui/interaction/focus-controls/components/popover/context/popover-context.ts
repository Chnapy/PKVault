import React from 'react';

export type PopoverContext = {
    opened: boolean;
    setOpened: React.Dispatch<React.SetStateAction<boolean>>;
};

export const popoverContext = React.createContext<PopoverContext | null>(null);
