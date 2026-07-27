import { Alert, Box, Group, Stack } from '@mantine/core';
import { AlertCircleIcon, ExternalLinkIcon, InfoIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { usePkmLegality } from '../../data/hooks/use-pkm-legality';
import { usePkmVariantAttach } from '../../data/hooks/use-pkm-variant-attach';
import { PKMLoadError, type PkmSaveDTO, type PkmVariantDTO } from '../../data/sdk/model';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { useTranslate } from '../../translate/i18n';
import { UIPathLine } from '../../ui/path/ui-path-line';
import { UIPokedexIcons } from '../../ui/pokedex/icons/ui-pokedex-icons';
import { UIGameImg } from '../../ui/sprite-img/ui-game-img';
import { UIContest } from '../../ui/storage/storage-details/content/cosmetic/ui-contest';
import { UIDetailsContentCosmetic } from '../../ui/storage/storage-details/content/cosmetic/ui-details-content-cosmetic';
import { UIDetailsContentMisc } from '../../ui/storage/storage-details/content/misc/ui-details-content-misc';
import { UIDetailsContentMove } from '../../ui/storage/storage-details/content/moves/ui-details-content-moves';
import { UIDetailsContentOrigin } from '../../ui/storage/storage-details/content/origin/ui-details-content-origin';
import { UIDetailsContentStats } from '../../ui/storage/storage-details/content/stats/ui-details-content-stats';
import { UIDetailsStatsRow, type UIDetailsStatName, type UIDetailsStatsRowProps } from '../../ui/storage/storage-details/content/stats/ui-details-stats-row';
import { UIDetailsStatsTotalRow } from '../../ui/storage/storage-details/content/stats/ui-details-stats-total-row';
import { UIDetailsContent, type UIDetailsContentProps } from '../../ui/storage/storage-details/content/ui-details-content';
import { UIDetailsContentExpanded } from '../../ui/storage/storage-details/content/ui-details-content-expanded';
import { UIDetailsContentSummary } from '../../ui/storage/storage-details/content/ui-details-content-summary';
import { ItemImg } from '../../img/item-img';
import { MoveItem } from './move-item/move-item';
import { Ribbon } from './ribbon/ribbon';
import { switchUtilRequired } from '../../util/switch-util';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { useStorageSelectExpanded } from './hooks/use-storage-select-expanded';

const isVariant = (pkm: PkmVariantDTO | PkmSaveDTO) => 'filepath' in pkm;

export const DetailsContent: React.FC = withErrorCatcher('default', () => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    const { expanded } = useStorageSelectExpanded();

    const { getSelected } = useCurrentStorage();
    const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId }) ?? null;
    const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id });

    const pkmIndexQuery = usePkmIndex(selectedSaveId, data => data.data.byId[ selectedId ?? '' ]);
    const pkm = pkmIndexQuery.data;

    const getPkmVariantAttach = usePkmVariantAttach();

    const pkmLegalityQuery = usePkmLegality(selectedId, selectedSaveId ?? undefined);
    const pkmLegality = pkmLegalityQuery.data?.data;

    if (!pkm || !pkmLegality)
        return null;

    const natureObj = pkm.nature === undefined ? undefined : staticData.natures[ pkm.nature ];

    const totalStats = pkm.stats.reduce((acc, stat) => acc + stat, 0);
    const totalIvs = pkm.iVs.reduce((acc, iv) => acc + iv, 0);
    const totalEvs = pkm.eVs.reduce((acc, ev) => acc + ev, 0);

    const issues: React.ReactNode[] = [
        isVariant(pkm) && pkm.isExternal && <Alert
            variant='default' title={<Group>
                <InfoIcon />
                {t('details.external-pkm-file.title')}
            </Group>}
        >
            <ExternalLinkIcon />{' '}
            {t('details.external-pkm-file.1')}
            <UIPathLine>{pkm.filepathAbsolute}</UIPathLine>
            <br />
            {t('details.external-pkm-file.2')}
        </Alert>,
        !pkm.isEnabled && <Alert variant='outline' color='red'
            title={<Group>
                <AlertCircleIcon />
                {t('details.is-disabled.title')}
            </Group>}
        >
            {t('details.is-disabled')}
        </Alert>,
        isVariant(pkm) && pkm.loadError && <Alert
            variant='outline' color='red'
            title={<Group>
                <AlertCircleIcon />
                {t('details.load-error.title')}
            </Group>}
        >
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
        </Alert>,
        isVariant(pkm) && pkm.isEnabled && !getPkmVariantAttach(pkm, pkm.id).isAttachedValid && <Alert
            variant='outline' color='orange'
            title={<Group>
                <UIPokedexIcons.Warn size='xs' />
                {t('details.attached-pkm-not-found.1')}
            </Group>}
        >
            {t('details.attached-pkm-not-found.1')}
            <br />
            <br />
            {t('details.attached-pkm-not-found.2')}
        </Alert>,
        pkm.isEnabled && pkmLegality && pkmLegality.illegalitiesCount > 0 && pkmLegality.validityReport && <Alert
            variant='outline' color='orange'
            title={<Group>
                <UIPokedexIcons.Warn size='xs' />
                {t('details.legality.1')}
            </Group>}
        >
            <Box style={{ whiteSpace: 'break-spaces' }}>
                {pkmLegality.validityReport}
            </Box>
            <br />
            {t('details.legality.2')}
        </Alert>,
    ].filter(Boolean);

    const content: UIDetailsContentProps[ 'content' ] = [
        issues.length > 0 && {
            name: 'issue',
            label: <><UIPokedexIcons.Warn size='xs' /> {t('details.issues.title')}</>,
            content: <Stack>
                {issues.map((issue, i) => <React.Fragment key={i}>
                    {issue}
                </React.Fragment>)}
            </Stack>,
        },
        pkm.isEnabled && {
            name: 'summary',
            label: t('details.summary.title'),
            content: <UIDetailsContentSummary
                id={pkm.id}
                heldItem={pkm.generation > 1
                    ? (pkm.heldItem > 0
                        ? <Group gap={4}>
                            <ItemImg item={pkm.heldItem} version={pkm.contextVersion} />
                            {staticData.getItem(pkm.contextVersion, pkm.heldItem)?.name}
                        </Group>
                        : '-')
                    : null}
                nature={pkm.generation > 2 ? staticData.natures[ pkm.nature ]?.name : undefined}
                ability={pkm.ability > 0 ? staticData.abilities[ pkm.ability ]?.name : undefined}
                specialAbility={pkm.generation === 3}
                pid={pkm.pid}
            />,
        },
        pkm.isEnabled && {
            name: 'stats',
            label: t('details.stats.title'),
            content: <UIDetailsContentStats iv ev asDv={pkm.generation < 3}>
                {([ 'hp', 'atk', 'def', 'spa', 'spd', 'spe' ] satisfies UIDetailsStatName[])
                    .map((stat, i): UIDetailsStatsRowProps => {
                        return {
                            stat,
                            level: pkm.level,
                            value: pkm.stats[ i ] ?? 0,
                            natureEffect: natureObj?.decreasedStatIndex === i + 1
                                ? 'decrease'
                                : (natureObj?.increasedStatIndex === i + 1
                                    ? 'increase'
                                    : undefined),
                            maxIv: staticData.versions[ pkm.contextVersion ]?.maxIV,
                            maxEv: staticData.versions[ pkm.contextVersion ]?.maxEV,
                            iv: pkm.iVs[ i ] ?? 0,
                            ev: pkm.eVs[ i ] ?? 0,
                        };
                    })
                    .map((props) => <UIDetailsStatsRow key={props.stat} {...props} />)}
                <UIDetailsStatsTotalRow
                    total={totalStats}
                    level={pkm.level}
                    maxIv={staticData.versions[ pkm.contextVersion ]?.maxIV}
                    maxEvTotal={pkm.generation > 2 ? 510 : 65535 * 6}
                    iv={totalIvs}
                    ev={totalEvs}
                />
            </UIDetailsContentStats>,
        },
        pkm.isEnabled && {
            name: 'moves',
            label: t('details.moves.title'),
            content: <UIDetailsContentMove
                moves={pkm.moves.map((move, i) => (
                    <MoveItem
                        key={i}
                        pkmId={pkm.id}
                        saveId={selectedSaveId}
                        move={move}
                        isAlpha={pkm.alphaMove === move}
                        isValid={pkmLegality.movesLegality[ i ]}
                    />
                ))}
                relearnMoves={pkm.relearnMoves && pkm.relearnMoves.map((move, i) => (
                    <MoveItem
                        key={i}
                        pkmId={pkm.id}
                        saveId={selectedSaveId}
                        move={move}
                        isAlpha={pkm.alphaMove === move}
                        isValid={pkmLegality.relearnMovesLegality[ i ]}
                    />
                ))}
            />,
        },
        pkm.isEnabled && (pkm.contest || pkm.ribbons) && {
            name: 'contest',
            label: t('details.contest'),
            content: <UIDetailsContentCosmetic
                contest={pkm.contest?.map((value, i) => <UIContest key={i} index={i} value={value} />)}
                ribbons={pkm.ribbons && Object.entries(pkm.ribbons)
                    .map(([ name, count ]) => <Ribbon key={name} name={name} count={count} />)}
            />,
        },
        pkm.isEnabled && {
            name: 'origin',
            label: t('details.origin'),
            content: <UIDetailsContentOrigin
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
            />,
        },
        pkm.isEnabled && {
            name: 'misc',
            label: t('details.misc.title'),
            content: <UIDetailsContentMisc
                isEgg={pkm.isEgg}
                eggHatchCount={pkm.eggHatchCount}
                friendship={pkm.friendship}
                language={staticData.languages[ pkm.languageID ]}
                homeTracker={pkm.homeTracker}
            />,
        },
    ].filter(item => typeof item === 'object');

    return expanded
        ? <UIDetailsContentExpanded content={content} />
        : <UIDetailsContent content={content} />;
});
