import type React from 'react';
import { theme } from '../theme';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Gender } from '../gender/gender';
import type { GameVersion, GenderType } from '../../data/sdk/model';

export type TextOriginProps = {
    version: GameVersion;
    tid: number;
    originTrainerName: string;
    originTrainerGender: GenderType;
    originMetDate?: string;
    originMetLocation: string;
    originMetLevel?: number;
};

export const TextOrigin: React.FC<TextOriginProps> = ({
    version,
    tid,
    originTrainerName,
    originTrainerGender,
    originMetDate,
    originMetLocation,
    originMetLevel,
}) => {

    return <>
        <span style={{ color: theme.text.primary }}>Origin</span>
        <br />
        Game <span style={{ color: theme.text.primary }}>Pokemon {getGameInfos(version).text}</span>
        <br />
        OT <span style={{ color: theme.text.primary }}>{originTrainerName}</span> <Gender gender={originTrainerGender} /> - TID <span style={{ color: theme.text.primary }}>{tid}</span>
        <br />
        {originMetLocation}{originMetLevel ? <> - Lv.{originMetLevel}</> : null}
    </>;
};
