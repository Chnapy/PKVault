import type React from 'react';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';
import { Button } from '../button/button';
import type { MoveItem } from '../../data/sdk/model';

export type TextMovesProps = {
    ability?: string;
    moves: MoveItem[];
    availableMoves: MoveItem[];
};

export const TextMoves: React.FC<TextMovesProps> = ({
    ability,
    moves,
    availableMoves,
}) => {
    const { editMode, setValue, register } = StorageDetailsForm.useContext();

    return <>
        {ability && <>
            Ability <span style={{ color: theme.text.primary }}>{ability}</span>
            <br /><br />
        </>}
        <span style={{ color: theme.text.primary }}>Moves</span>
        <br />
        {editMode
            ? moves.map((move, i) => <select key={i} {...register(`moves.${i}`, { valueAsNumber: true })}>
                {availableMoves.map((item) => <option key={item.id} value={item.id}>{item.id} - {item.text}</option>)}
            </select>)
            : <>{moves.map((move, i) => <div key={i}>
                {i + 1}. {move.text}
            </div>)}
                <Button onClick={() => setValue('editMode', true)}>Edit</Button>
            </>}
    </>;
};
