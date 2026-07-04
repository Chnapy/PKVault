import React from 'react';
import { Route } from '../../../routes/storage';
import { useControlsCurrentType } from '../../../ui-new/interaction/controls/use-controls-current-type';

export const useStorageSelectExpanded = () => {
    const controlsGamepad = useControlsCurrentType() === 'gamepad';

    const navigate = Route.useNavigate();

    const expanded = Route.useSearch({ select: search => !controlsGamepad && search.selectExpanded === 'expanded' });

    const toggleExpanded = React.useMemo(() => controlsGamepad
        ? undefined
        : (() => {
            navigate({
                search: search => ({
                    selectExpanded: search.selectExpanded === 'expanded' ? 'none' : 'expanded',
                }),
            });
        }), [ controlsGamepad, navigate ]);

    return {
        expanded,
        toggleExpanded,
    };
};
