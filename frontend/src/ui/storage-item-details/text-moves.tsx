import type React from 'react';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';
import { Button } from '../button/button';
import type { MoveItem } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';

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

    const staticData = useStaticData();

    return <>
        {ability && <>
            Ability <span style={{ color: theme.text.primary }}>{ability}</span>
            <br /><br />
        </>}
        <span style={{ color: theme.text.primary }}>Moves</span>
        <br />
        {editMode
            ? moves.map((move, i) => <select key={i} {...register(`moves.${i}`, { valueAsNumber: true })}>
                {availableMoves.map((item) => <option key={item.id} value={item.id}>{item.id} - {staticData.moves[ item.id ].name}</option>)}
            </select>)
            : <>{moves.map((move, i) => <div key={i}>
                {i + 1}. {staticData.moves[ move.id ].name}
            </div>)}
                <Button onClick={() => setValue('editMode', true)}>Edit</Button>
            </>}
    </>;
};
