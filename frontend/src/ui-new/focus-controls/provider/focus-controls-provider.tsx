import { getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { addGamepadEventListener } from '../../controls/gamepad/gamepad-event';
import { ControlsProvider } from '../../controls/provider/controls-provider';
import { FocusProvider } from '../../focus/provider/focus-provider';
import { FocusScope } from '../../focus/scope/focus-scope';

export const FocusControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    React.useEffect(() => {
        const focusIfNone = () => {
            if (!getCurrentFocusKey()) {
                const focusableEl = document.querySelector<HTMLElement>('[data-focus-key]');
                setFocus(focusableEl!.dataset.focusKey!);
            }
        };

        const keydownListener = () => {
            focusIfNone();
        };

        window.addEventListener('keydown', keydownListener);

        const removeGamepadListener = addGamepadEventListener(() => {
            focusIfNone();
        });

        return () => {
            removeGamepadListener();
            window.removeEventListener('keydown', keydownListener);
        };
    }, []);

    return <ControlsProvider>
        <FocusProvider>
            <FocusScope id="root">
                {children}
            </FocusScope>
        </FocusProvider>
    </ControlsProvider>
};
