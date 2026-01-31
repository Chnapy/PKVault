import type React from 'react';
import type { DexItemDTO } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { useTranslate } from '../../translate/i18n';
import { ItemImg } from '../../ui/details-card/item-img';
import { Icon } from '../../ui/icon/icon';
import { ShinyIcon } from '../../ui/icon/shiny-icon';
import { theme } from '../../ui/theme';
import { css } from '@emotion/css';

type PokedexCountProps = {
    data: DexItemDTO[][];
};

export const PokedexCount: React.FC<PokedexCountProps> = ({ data }) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const getFilteredItemsCount = (filterFn: (value: DexItemDTO) => boolean) => data.filter(dexItems =>
        dexItems.some(filterFn)
    ).length;

    return <div className={css({
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        gap: 4
    })}>
        <Icon name='eye' solid forButton /> <span className={css({ color: theme.text.primary })}>{getFilteredItemsCount(item => item.forms.some(form => form.isSeen))}</span>
        <ItemImg
            item={staticData.itemPokeball.id}
            size={'1lh'}
            className={css({ margin: '0 -2px' })}
        /><span className={css({ color: theme.text.primary })}>{getFilteredItemsCount(item => item.forms.some(form => form.isCaught))}</span>
        <Icon name='folder' solid forButton /> <span className={css({ color: theme.text.primary })}>{getFilteredItemsCount(item => item.forms.some(form => form.isOwned))}</span>
        <ShinyIcon /><span className={css({ color: theme.text.primary })}>{getFilteredItemsCount(item => item.forms.some(form => form.isOwnedShiny))}</span> {t('total')}.
        <span className={css({ color: theme.text.primary })}>{data.length}</span>
    </div>;
};
