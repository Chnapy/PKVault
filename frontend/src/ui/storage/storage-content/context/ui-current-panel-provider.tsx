import React from 'react';
import { currentPanelContext, type CurrentPanelContext } from './ui-panel-context';

type CurrentPanelProps = {
    initialValue?: string;
    value?: string;
    children: React.ReactNode;
};

export const CurrentPanelProvider: React.FC<CurrentPanelProps> = ({ initialValue, value, children }) => {
    const [ stateValue, setState ] = React.useState(initialValue ?? '');

    const ctx = React.useMemo((): CurrentPanelContext => ({
        value: value ?? stateValue,
        setValue: setState,
    }), [ stateValue, value ]);

    return <currentPanelContext.Provider value={ctx}>
        {children}
    </currentPanelContext.Provider>;
};
