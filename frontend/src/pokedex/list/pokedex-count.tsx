import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import type { DexItemDTO } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { Icon } from '../../ui/icon/icon';
import { ShinyIcon } from '../../ui/icon/shiny-icon';
import { theme } from '../../ui/theme';

type PokedexCountProps = {
    data: DexItemDTO[][];
};

export const PokedexCount: React.FC<PokedexCountProps> = ({ data }) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const getFilteredItemsCount = (filterFn: (value: DexItemDTO) => boolean) => data.filter(dexItems =>
        dexItems.some(filterFn)
    ).length;

    return <div style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        gap: 4
    }}>
        <Icon name='eye' solid forButton /> <span style={{ color: theme.text.primary }}>{getFilteredItemsCount(item => item.isAnySeen)}</span>
        <img src={getApiFullUrl(staticData.itemPokeball.sprite)} style={{
            height: '1lh',
            verticalAlign: 'middle'
        }} /><span style={{ color: theme.text.primary }}>{getFilteredItemsCount(item => item.isCaught)}</span>
        <Icon name='folder' solid forButton /> <span style={{ color: theme.text.primary }}>{getFilteredItemsCount(item => item.isOwned)}</span>
        <ShinyIcon /><span style={{ color: theme.text.primary }}>{getFilteredItemsCount(item => item.isOwnedShiny)}</span> {t('total')}.
        <span style={{ color: theme.text.primary }}>{data.length}</span>
    </div>;
};
