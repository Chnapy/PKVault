import type React from 'react';
import type { GenderType } from '../../data/sdk/model';
import { getSpeciesNO } from '../dex-item/util/get-species-no';
import { Gender } from '../gender/gender';
import { theme } from '../theme';
import { TypeItem } from '../type-item/type-item';

export type DetailsMainInfosProps = {
    id?: string;
    pid?: number;
    species: number;
    speciesName: string;
    nickname?: React.ReactNode;
    genders: GenderType[];
    types: number[];
    level?: number;
};

export const DetailsMainInfos: React.FC<DetailsMainInfosProps> = ({ id, pid = 0, species, speciesName, nickname, genders, types, level }) => {

    return <>
        {nickname && <>{nickname}{' - '}</>}
        <span style={{ color: theme.text.primary }}>{speciesName}</span>

        {genders.map(gender => <span
            key={gender}
            style={{
                float: 'right',
            }}
        >
            <Gender gender={gender} />
        </span>)}
        <br />
        <div style={{ display: 'flex', gap: 4, height: '1lh' }}>
            {types.map(type => <TypeItem key={type} type={type} />)}
            {level !== undefined && <span
                style={{
                    marginLeft: 'auto',
                }}
            >
                Lv.<span style={{ color: theme.text.primary }}>{level}</span>
            </span>}
        </div>
        <br />
        Dex local N°<span style={{ color: theme.text.primary }}>TODO</span>{' '}
        Dex natio. N°<span style={{ color: theme.text.primary }}>{getSpeciesNO(species)}</span>
        <br />
        {id !== undefined ? <>
            ID <span style={{ color: theme.text.primary }}>{id}</span> {pid > 0 && <>PID <span style={{ color: theme.text.primary }}>{pid}</span></>}
        </> : ' '}
    </>;
};
