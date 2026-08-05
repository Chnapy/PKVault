import React from 'react';
import { usePkmIndex } from '../../../../data/hooks/use-pkm-index';
import { MoveCategory, type StaticMove } from '../../../../data/sdk/model';
import { useStaticData } from '../../../../hooks/use-static-data';
import { pick } from '../../../../util/pick';
import { useSelectCallback } from '../../../../util/use-select-callback';

export const useStaticMove = (saveId: number | null, pkmId: string | undefined, generation?: number) => {
    const staticData = useStaticData();

    const pkmIndexQuery = usePkmIndex(saveId,
        useSelectCallback(data => {
            const pkm = data.data.byId[ pkmId ?? '' ];
            if (!pkm)
                return;

            return pick(pkm, [ 'generation', 'hiddenPowerCategory', 'hiddenPowerPower', 'hiddenPowerType', 'friendship' ]);
        }, [ pkmId ]),
        {
            enabled: !!pkmId,
        });

    const pkm = pkmIndexQuery.data;

    const getInnerStaticMove = React.useCallback((move: number): StaticMove | undefined => {
        const staticMove = staticData.moves[ move ];

        // hidden power
        if (move === 237) {
            return staticMove && {
                ...staticMove,
                dataUntilGeneration: [ {
                    untilGeneration: 99,
                    type: pkm?.hiddenPowerType ?? 1,
                    power: pkm?.hiddenPowerPower,
                    category: pkm?.hiddenPowerCategory ?? MoveCategory.SPECIAL,
                } ]
            };
        }
        // return
        else if (move === 216) {
            const returnPower = pkm ? Number.parseInt((pkm.friendship / 2.5).toString()) : undefined;
            return staticMove && {
                ...staticMove,
                dataUntilGeneration: [ {
                    ...staticMove.dataUntilGeneration[ staticMove.dataUntilGeneration.length - 1 ]!,
                    untilGeneration: 99,
                    power: returnPower,
                } ]
            };
        }
        // frustration
        else if (move === 218) {
            const frustrationPower = pkm ? Number.parseInt(((255 - pkm.friendship) / 2.5).toString()) : undefined;
            return staticMove && {
                ...staticMove,
                dataUntilGeneration: [ {
                    ...staticMove.dataUntilGeneration[ staticMove.dataUntilGeneration.length - 1 ]!,
                    untilGeneration: 99,
                    power: frustrationPower,
                } ]
            };
        }

        return staticMove;
    }, [ pkm, staticData.moves ]);

    const gen = generation ?? pkm?.generation;

    return React.useCallback((move: number) => {
        const staticMove = getInnerStaticMove(move);
        const forGen = gen !== undefined ? staticMove?.dataUntilGeneration.find(g => g.untilGeneration >= gen) : undefined;

        return { staticMove, forGen };
    }, [ getInnerStaticMove, gen ]);
};
