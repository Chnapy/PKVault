import type React from 'react';
import { useControls } from '../../../controls/use-controls';
import { Focus } from '../../../focus/provider/use-focus-context';
import { getBackControl } from '../../common-controls/back-controls';
import { getMoveControl } from '../../common-controls/move-controls';

export const ControlsGlobals: React.FC = () => {
    const { popScope } = Focus.usePushPopScope();

    useControls(
        'globals',
        false,
        0,
        [
            getMoveControl({
                label: 'Navigate',
            }),
            getBackControl({
                label: 'Back',
                action: () => popScope(),
            }),
        ],
        { enabled: true },
    );

    return null;
};
