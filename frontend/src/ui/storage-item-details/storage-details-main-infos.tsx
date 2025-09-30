import type React from 'react';
import type { GenderType } from '../../data/sdk/model';
import { DetailsMainInfos } from '../details-card/details-main-infos';
import { TextInput } from '../input/text-input';
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

    return <DetailsMainInfos
        id={id}
        pid={pid}
        species={species}
        speciesName={speciesName}
        nickname={formContext.editMode
            ? <TextInput
                {...formContext.register('nickname', { maxLength: nicknameMaxLength })}
                // maxLength={nicknameMaxLength}
                style={{ display: 'inline-block', height: '1lh', width: 8 * nicknameMaxLength, padding: 0, textAlign: 'center' }}
            />
            : nickname}
        genders={gender ? [ gender ] : []}
        types={types}
        level={level}
    />;
};
