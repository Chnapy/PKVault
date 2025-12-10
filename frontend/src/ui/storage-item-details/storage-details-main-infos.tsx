import type React from 'react';
import { DetailsMainInfos } from '../details-card/details-main-infos';
import { TextInput } from '../input/text-input';
import { StorageDetailsForm } from './storage-details-form';

export type StorageDetailsMainInfosProps = {
    idBase: string;
    pid: number;
    species: number;
    speciesName: string;
    nickname: string;
    nicknameMaxLength: number;
    // gender?: GenderType;
    types: number[];
    levelUpPercent: number;
    level: number;
    eggHatchCount?: number;
};

export const StorageDetailsMainInfos: React.FC<StorageDetailsMainInfosProps> = ({
    idBase, pid, species, speciesName, nickname, nicknameMaxLength, types, levelUpPercent, level, eggHatchCount
}) => {
    const formContext = StorageDetailsForm.useContext();

    return <DetailsMainInfos
        idBase={idBase}
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
        // genders={gender !== undefined ? [ gender ] : []}
        types={types}
        levelUpPercent={levelUpPercent}
        level={level}
        eggHatchCount={eggHatchCount}
    />;
};
