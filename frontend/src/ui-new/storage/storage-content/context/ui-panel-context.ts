import React from 'react';

const panelContext = React.createContext('');

export const PanelProvider = panelContext.Provider;

export type CurrentPanelContext = {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
};

export const currentPanelContext = React.createContext<CurrentPanelContext | null>(null);

export const useCurrentPanel = () => {
    const currentPanel = React.use(currentPanelContext)!;
    const panel = React.use(panelContext);

    return {
        isInCurrentPanel: currentPanel.value === panel,
        normalizeCurrentPanel: () => {
            if (currentPanel.value !== panel)
                currentPanel.setValue(panel);
        },
    };
};
