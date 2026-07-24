import React from 'react';
import { Route } from '../../../routes/pokedex';
import { useControlsCurrentType } from '../../../ui/interaction/controls/use-controls-current-type';

export const usePokedexSelectExpanded = () => {
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
