import { getCurrentFocusKey, setFocus } from '@noriginmedia/norigin-spatial-navigation-core';
import React from 'react';
import { addGamepadEventListener } from '../../controls/gamepad/gamepad-event';
import { ControlsProvider } from '../../controls/provider/controls-provider';
import { FocusProvider } from '../../focus/provider/focus-provider';
import { FocusScope } from '../../focus/scope/focus-scope';
import { ControlsGlobals } from '../components/controls-globals/controls-globals';

export const FocusControlsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    React.useEffect(() => {
        const focusIfNone = () => {
            if (!getCurrentFocusKey()) {
                const focusableEl = document.querySelector<HTMLElement>('[data-focus-key]');
                if (focusableEl?.dataset.focusKey)
                    setFocus(focusableEl.dataset.focusKey);
                else
                    console.warn('focusable element not found', focusableEl)
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
                <ControlsGlobals />

                {children}
            </FocusScope>
        </FocusProvider>
    </ControlsProvider>
};
