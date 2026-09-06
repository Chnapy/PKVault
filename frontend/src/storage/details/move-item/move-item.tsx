import React from 'react';
import { UIDetailsMoveRow, type UIDetailsMoveRowProps } from '../../../ui/storage/storage-details/content/moves/ui-details-move-row';
import { useStaticMove } from './hooks/use-static-move';

export type MoveItemProps = Pick<UIDetailsMoveRowProps, 'nameWidth' | 'onClick' | 'isAlpha' | 'isValid'> & {
    pkmId?: string;
    saveId: number | null;
    generation?: number;
    move: number;
    level?: number;
};

export const MoveItem: React.FC<MoveItemProps> = ({ pkmId, saveId, generation, move, level, isAlpha, isValid, ...rest }) => {
    const getStaticMove = useStaticMove(saveId, pkmId, generation);

    const { staticMove, forGen } = React.useMemo(() => getStaticMove(move), [ getStaticMove, move ]);

    if (!staticMove || !forGen)
        return null;

    return <UIDetailsMoveRow
        type={forGen.type}
        category={forGen.category}
        name={staticMove.name}
        power={forGen.power}
        accuracy={forGen.accuracy}
        level={level}
        isAlpha={isAlpha}
        isValid={isValid}
        {...rest}
    />;
};
