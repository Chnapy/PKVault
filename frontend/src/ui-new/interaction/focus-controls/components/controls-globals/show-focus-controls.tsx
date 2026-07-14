import React from 'react';
import { useControlsCurrentType } from '../../../controls/use-controls-current-type';

export const ShowFocusControls: React.FC = () => {
    const controlsCurrentType = useControlsCurrentType();

    React.useEffect(() => {
        const previousValue = document.body.dataset.controlsType;
        if (previousValue !== controlsCurrentType) {
            document.body.dataset.controlsType = controlsCurrentType;

            if (controlsCurrentType !== 'mouse')
                document.body.dataset.showFocus = 'true';
            else
                delete document.body.dataset.showFocus
        }
    }, [ controlsCurrentType ]);

    return null;
};
