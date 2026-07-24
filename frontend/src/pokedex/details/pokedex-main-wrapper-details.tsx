import React from 'react';
import { Route } from '../../routes/pokedex';
import type { PopoverContext } from '../../ui/interaction/focus-controls/components/popover/context/popover-context';
import { UIPokedexMainWrapperDetails, type UIPokedexMainWrapperDetailsProps } from '../../ui/pokedex/main/ui-pokedex-main-wrapper-details';
import { usePokedexSelectExpanded } from './hooks/use-pokedex-select-expanded';
import { PokedexDetails } from './pokedex-details';

export const PokedexMainWrapperDetails: React.FC<Pick<UIPokedexMainWrapperDetailsProps, 'children'>> = ({ children }) => {
    const opened = Route.useSearch({ select: search => search.selected !== undefined });

    const navigate = Route.useNavigate();

    const { expanded } = usePokedexSelectExpanded();

    const stateRef = React.useRef({ opened });

    React.useEffect(() => {
        stateRef.current = { opened };
    }, [ opened ])

    const setOpened: PopoverContext[ 'setOpened' ] = opened => {
        if (!opened) {
            navigate({
                search: {
                    selected: undefined,
                },
            });
        }
    };

    return <UIPokedexMainWrapperDetails
        opened={opened}
        setOpened={setOpened}
        expanded={expanded}
        details={<PokedexDetails />}
    >
        {children}
    </UIPokedexMainWrapperDetails>;
};
