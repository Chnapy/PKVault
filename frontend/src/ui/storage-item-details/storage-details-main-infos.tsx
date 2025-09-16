import type React from 'react';
import type { GenderType } from '../../data/sdk/model';
import { getSpeciesNO } from '../dex-item/util/get-species-no';
import { Gender } from '../gender/gender';
import { TextInput } from '../input/text-input';
import { theme } from '../theme';
import { TypeItem } from '../type-item/type-item';
import { StorageDetailsForm } from './storage-details-form';

export type StorageDetailsMainInfosProps = {
    id: string;
    pid: number;
    species: number;
    speciesName: string;
    nickname: string;
    nicknameMaxLength: number;
    gender?: GenderType;
    types: number[];
    level: number;
};

export const StorageDetailsMainInfos: React.FC<StorageDetailsMainInfosProps> = ({ id, pid, species, speciesName, nickname, nicknameMaxLength, gender, types, level }) => {
    const formContext = StorageDetailsForm.useContext();

    return <>
        {formContext.editMode
            ? <TextInput
                {...formContext.register('nickname', { maxLength: nicknameMaxLength })}
                // maxLength={nicknameMaxLength}
                style={{ display: 'inline-block', height: '1lh', width: 8 * nicknameMaxLength, padding: 0, textAlign: 'center' }}
            />
            : nickname}
        {' - '}<span style={{ color: theme.text.primary }}>{speciesName}</span>

        {gender !== undefined && <span
            style={{
                float: 'right',
            }}
        >
            <Gender gender={gender} />
        </span>}
        <br />
        <div style={{ display: 'flex', gap: 4, height: '1lh' }}>
            {types.map(type => <TypeItem key={type} type={type} />)}
            <span
                style={{
                    marginLeft: 'auto',
                }}
            >
                Lv.<span style={{ color: theme.text.primary }}>{level}</span>
            </span>
        </div>
        <br />
        Dex local N°<span style={{ color: theme.text.primary }}>TODO</span>{' '}
        Dex natio. N°<span style={{ color: theme.text.primary }}>{getSpeciesNO(species)}</span>
        <br />
        ID <span style={{ color: theme.text.primary }}>{id}</span> {pid > 0 && <>PID <span style={{ color: theme.text.primary }}>{pid}</span></>}
    </>;
};
