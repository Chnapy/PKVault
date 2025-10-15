import type React from 'react';
import type { Gender as GenderType } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';
import { getSpeciesNO } from '../dex-item/util/get-species-no';
import { Gender } from '../gender/gender';
import { theme } from '../theme';
import { TypeItem } from '../type-item/type-item';
import { DetailsLevel } from './details-level';

export type DetailsMainInfosProps = {
    id?: string;
    pid?: number;
    species: number;
    speciesName: React.ReactNode;
    nickname?: React.ReactNode;
    genders: GenderType[];
    types: number[];
    level?: number;
};

export const DetailsMainInfos: React.FC<DetailsMainInfosProps> = ({ id, pid = 0, species, speciesName, nickname, genders, types, level }) => {
    const { t } = useTranslate();

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
            {level !== undefined && <span style={{ marginLeft: 'auto', color: theme.text.primary }}>
                <DetailsLevel level={level} />
            </span>}
        </div>
        <br />
        {t('details.dex.local')}<span style={{ color: theme.text.primary }}>TODO</span>{' '}
        {t('details.dex.natio')}<span style={{ color: theme.text.primary }}>{getSpeciesNO(species)}</span>
        <br />
        {id !== undefined ? <>
            {t('details.id')} <span style={{ color: theme.text.primary }}>{id}</span> {pid > 0 && <>{t('details.pid')} <span style={{ color: theme.text.primary }}>{pid}</span></>}
        </> : ' '}
    </>;
};
