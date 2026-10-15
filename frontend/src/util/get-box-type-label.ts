import { BoxType } from '../data/sdk/model';
import { useTranslate } from '../translate/i18n';
import { switchUtil } from './switch-util';

export const getBoxTypeLabel = (boxType: BoxType, t: ReturnType<typeof useTranslate>[ 't' ]) => {
    return switchUtil(boxType, {
        [ BoxType.Inventory ]: t('storage.box.edit.type.inventory'),
        [ BoxType.Box ]: t('storage.box.edit.type.box'),
        [ BoxType.SurpriseTrade ]: t('storage.box.edit.type.surprisetrade'),
        [ BoxType.PGL ]: t('storage.box.edit.type.pgl'),
        [ BoxType.Scripted ]: t('storage.box.edit.type.scripted'),
        [ BoxType.Pokéwalker ]: t('storage.box.edit.type.pokéwalker'),
        [ BoxType.BattleAgency ]: t('storage.box.edit.type.battleagency'),
        [ BoxType.Shiny ]: t('storage.box.edit.type.shiny'),
        [ BoxType.Ride ]: t('storage.box.edit.type.ride'),
        [ BoxType.Resort ]: t('storage.box.edit.type.resort'),
        [ BoxType.Underground ]: t('storage.box.edit.type.underground'),
        [ BoxType.Fused ]: t('storage.box.edit.type.fused'),
        [ BoxType.GTS ]: t('storage.box.edit.type.gts'),
        [ BoxType.Daycare ]: t('storage.box.edit.type.daycare'),
        [ BoxType.BattleBox ]: t('storage.box.edit.type.battlebox'),
        [ BoxType.Party ]: t('storage.box.edit.type.party'),
    });
};
