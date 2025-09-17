import React from 'react';

export const useTriggerOnHover = (enable?: boolean) => {
    const timeoutRef = React.useRef<NodeJS.Timeout>(undefined);
    const timeoutDelay = 800;
    const getHoverEventHandler = (callback: (event: React.BaseSyntheticEvent) => void) => {
        if (!enable) {
            return undefined;
        }

        return (event: React.BaseSyntheticEvent) => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => callback(event), timeoutDelay);
        };
    };

    return getHoverEventHandler;
};
