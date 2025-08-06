import type React from 'react';
import { theme } from '../theme';

export type TextMovesProps = {
    ability?: string;
    moves: string[];
};

export const TextMoves: React.FC<TextMovesProps> = ({
    ability,
    moves
}) => {

    return <>
        {ability && <>
            Ability <span style={{ color: theme.text.primary }}>{ability}</span>
            <br /><br />
        </>}
        <span style={{ color: theme.text.primary }}>Moves</span>
        <br />
        {moves.map((move, i) => <div key={i}>
            {i + 1}. {move}
        </div>)}
    </>;
};
