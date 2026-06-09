import { Box, Group } from '@mantine/core';
import { AlertTriangleIcon, ExternalLinkIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { usePkmLegality } from '../../data/hooks/use-pkm-legality';
import { usePkmVariantAttach } from '../../data/hooks/use-pkm-variant-attach';
import { PKMLoadError, type PkmSaveDTO, type PkmVariantDTO } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { useTranslate } from '../../translate/i18n';
import { UIPathLine } from '../../ui-new/path/ui-path-line';
import { UIGameImg } from '../../ui-new/sprite-img/ui-game-img';
import { UIContest } from '../../ui-new/storage/storage-details/content/cosmetic/ui-contest';
import { UIDetailsContentCosmetic } from '../../ui-new/storage/storage-details/content/cosmetic/ui-details-content-cosmetic';
import { UIDetailsContentMisc } from '../../ui-new/storage/storage-details/content/misc/ui-details-content-misc';
import { UIDetailsContentMove } from '../../ui-new/storage/storage-details/content/moves/ui-details-content-moves';
import { UIDetailsContentOrigin } from '../../ui-new/storage/storage-details/content/origin/ui-details-content-origin';
import { UIDetailsContentStats } from '../../ui-new/storage/storage-details/content/stats/ui-details-content-stats';
import { UIDetailsStatsRow, type UIDetailsStatName, type UIDetailsStatsRowProps } from '../../ui-new/storage/storage-details/content/stats/ui-details-stats-row';
import { UIDetailsContent } from '../../ui-new/storage/storage-details/content/ui-details-content';
import { UIDetailsContentSummary } from '../../ui-new/storage/storage-details/content/ui-details-content-summary';
import { ItemImg } from '../../ui/img/item-img';
import { MoveItem } from '../../ui/move-item/move-item';
import { Ribbon } from '../../ui/ribbon/ribbon';
import { switchUtilRequired } from '../../util/switch-util';
import { useCurrentStorage } from '../panel/storage-panel-context';

const isVariant = (pkm: PkmVariantDTO | PkmSaveDTO) => 'filepath' in pkm;

export const DetailsContent: React.FC = () => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const { getSelected } = useCurrentStorage();
    const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId }) ?? null;
    const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id });

    const pkmIndexQuery = usePkmIndex(selectedSaveId, data => data.data.byId[ selectedId ?? '' ]);
    const pkm = pkmIndexQuery.data;

    const getPkmVariantAttach = usePkmVariantAttach();

    const pkmLegalityQuery = usePkmLegality(selectedId, selectedSaveId ?? undefined);
    const pkmLegality = pkmLegalityQuery.data?.data;

    if (!pkm)
        return null;

    const issues: React.ReactNode[] = [
        isVariant(pkm) && pkm.isExternal && <Box
            // bgColor={theme.bg.dark}
            // mah={200}
            style={{
                minHeight: '1lh',
                flexShrink: 0.1,
            }}
        >
            <ExternalLinkIcon />{' '}
            {t('details.external-pkm-file.1')}
            <UIPathLine>{pkm.filepathAbsolute}</UIPathLine>
            <br />
            {t('details.external-pkm-file.2')}
        </Box>,
        isVariant(pkm) && pkm.loadError && !pkm.isEnabled && <Box
            // bgColor={theme.bg.red}
            // mah={200}
            style={{
                minHeight: '1lh',
                flexShrink: 0.1,
            }}
        >
            {!pkm.isEnabled && t('details.is-disabled')}
            <br />
            <br />
            {pkm.loadError && t('details.load-error', {
                loadError: switchUtilRequired(pkm.loadError, {
                    [ PKMLoadError.UNKNOWN ]: t('details.load-error.0'),
                    [ PKMLoadError.NOT_LOADED ]: t('details.load-error.0'),
                    [ PKMLoadError.NOT_FOUND ]: t('details.load-error.1'),
                    [ PKMLoadError.TOO_SMALL ]: t('details.load-error.2'),
                    [ PKMLoadError.TOO_BIG ]: t('details.load-error.3'),
                    [ PKMLoadError.UNAUTHORIZED ]: t('details.load-error.4'),
                }),
                filepath: pkm.filepath,
            })}
        </Box>,
        isVariant(pkm) && pkm.isEnabled && !getPkmVariantAttach(pkm, pkm.id).isAttachedValid && <Box
            // bgColor={theme.bg.yellow}
            // mah={200}
            style={{
                minHeight: '1lh',
                flexShrink: 0.1,
            }}
        >
            {t('details.attached-pkm-not-found.1')}
            <br />
            <br />
            {t('details.attached-pkm-not-found.2')}
        </Box>,
        pkm.isEnabled && pkmLegality && pkmLegality.illegalitiesCount > 0 && pkmLegality.validityReport && <Box
            // bgColor={theme.bg.yellow}
            // mah={200}
            style={{
                minHeight: '1lh',
                flexShrink: 0.1,
            }}
        >
            <AlertTriangleIcon />{' '}
            {t('details.legality.1')}
            <br />
            <br />
            {pkmLegality.validityReport}
            <br />
            <br />
            {t('details.legality.2')}
        </Box>,
    ].filter(Boolean);

    return <UIDetailsContent
        issues={issues.length > 0 && <Box
            style={{ whiteSpace: 'break-spaces' }}
        >
            {issues.map((issue, i) => <React.Fragment key={i}>
                {issue}
            </React.Fragment>)}
        </Box>}
        summary={<UIDetailsContentSummary
            heldItem={pkm.heldItem > 0
                ? <Group gap={4}>
                    <ItemImg item={pkm.heldItem} version={pkm.contextVersion} />
                    {staticData.getItem(pkm.contextVersion, pkm.heldItem)?.name}
                </Group>
                : null}
            nature={staticData.natures[ pkm.nature ]?.name}
            ability={staticData.abilities[ pkm.ability ]?.name}
            pid={pkm.pid}
        />}
        stats={<UIDetailsContentStats iv ev>
            {([ 'hp', 'atk', 'def', 'spa', 'spd', 'spe' ] satisfies UIDetailsStatName[])
                .map((stat, i): UIDetailsStatsRowProps => ({
                    stat,
                    value: pkm.stats[ i ] ?? 0,
                    iv: pkm.iVs[ i ] ?? 0,
                    ev: pkm.eVs[ i ] ?? 0,
                }))
                .map((props) => <UIDetailsStatsRow key={props.stat} {...props} />)}
        </UIDetailsContentStats>}
        moves={<UIDetailsContentMove>
            {pkm.moves.map((move, i) => {
                return <MoveItem
                    key={i}
                    pkmId={pkm.id}
                    saveId={selectedSaveId}
                    move={move}
                />;
            })}
        </UIDetailsContentMove>}
        contest={<UIDetailsContentCosmetic
            contest={pkm.contest?.map((value, i) => <UIContest key={i} index={i} value={value} />)}
            ribbons={pkm.ribbons && Object.entries(pkm.ribbons)
                .map(([ name, count ]) => <Ribbon key={name} name={name} count={count} />)}
        />}
        origin={<UIDetailsContentOrigin
            game={<Group>
                <UIGameImg
                    size='1lh'
                    version={pkm.version}
                    name={staticData.versions[ pkm.version ]?.name}
                />
                {staticData.versions[ pkm.version ]?.name}
            </Group>}
            ot={pkm.originTrainerName}
            otGender={pkm.originTrainerGender}
            ht={pkm.handlingTrainerName}
            htGender={pkm.handlingTrainerGender}
            tid={pkm.tid}
            sid={pkm.sid}
            originMetLocation={pkm.originMetLocation}
            originMetLevel={pkm.originMetLevel}
            originMetDate={pkm.originMetDate}
            fatefulEncounter={pkm.fatefulEncounter}
        />}
        misc={<UIDetailsContentMisc
            language={staticData.languages[ pkm.languageID ]}
            homeTracker={pkm.homeTracker}
        />}
    />;
};
