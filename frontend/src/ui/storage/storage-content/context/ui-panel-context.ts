import React from 'react';

const panelContext = React.createContext<'left' | 'right' | 'header'>('left');

export const PanelProvider = panelContext.Provider;

export const usePanel = () => React.use(panelContext);

export type CurrentPanelContext = {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
};

export const currentPanelContext = React.createContext<CurrentPanelContext | null>(null);

export const useCurrentPanel = () => {
    const currentPanel = React.use(currentPanelContext);
    const panel = usePanel();

    const setValue = currentPanel?.setValue;

    return {
        isInCurrentPanel: currentPanel?.value === panel,
        normalizeCurrentPanel: React.useCallback(() => {
            setValue?.(panel);
        }, [ panel, setValue ]),
    };
};
