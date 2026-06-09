import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStaticData } from '../../../hooks/use-static-data';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';

export const useStaticMove = (saveId: number | null, pkmId: string | undefined) => {
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

    const getInnerStaticMove = React.useCallback((move: number) => {
        const staticMove = staticData.moves[ move ];

        if (!pkm) return;

        // hidden power
        if (move === 237) {
            return staticMove && pkm && {
                ...staticMove,
                dataUntilGeneration: [ {
                    untilGeneration: 99,
                    type: pkm.hiddenPowerType,
                    power: pkm.hiddenPowerPower,
                    category: pkm.hiddenPowerCategory,
                } ]
            };
        }
        // return
        else if (move === 216) {
            const returnPower = Number.parseInt((pkm.friendship / 2.5).toString());
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
            const frustrationPower = Number.parseInt(((255 - pkm.friendship) / 2.5).toString());
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

    return React.useCallback((move: number) => {
        const staticMove = getInnerStaticMove(move);
        const forGen = pkm && staticMove?.dataUntilGeneration.find(gen => gen.untilGeneration >= pkm.generation);

        return { staticMove, forGen };
    }, [ getInnerStaticMove, pkm ]);
};
