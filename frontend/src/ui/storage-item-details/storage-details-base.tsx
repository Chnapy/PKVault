import { css } from '@emotion/css';
import type React from 'react';
import { GameVersion, Gender as GenderType, type PkmLegalityDTO, type PkmSaveDTO } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Route } from '../../routes/storage';
import { MoveContext } from '../../storage/move/context/move-context';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { DetailsCardContainer } from '../details-card/details-card-container';
import { DetailsMainImg } from '../details-card/details-main-img';
import { ItemImg } from '../details-card/item-img';
import { Gender } from '../gender/gender';
import { AlphaIcon } from '../icon/alpha-icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { TextContainer } from '../text-container/text-container';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';
import { StorageDetailsMainInfos } from './storage-details-main-infos';
import { StorageDetailsTitle } from './storage-details-title';
import { TextMoves } from './text-moves';
import { TextOrigin } from './text-origin';
import { TextStats } from './text-stats';

export type StorageDetailsBaseProps = Pick<PkmSaveDTO,
    | 'id' | 'idBase' | 'pid' | 'species' | 'context' | 'generation' | 'form' | 'isAlpha' | 'isShiny' | 'isEgg' | 'isShadow' | 'ball'
    | 'gender' | 'level' | 'levelUpPercent' | 'eggHatchCount' | 'friendship' | 'nickname' | 'nicknameMaxLength' | 'types' | 'nature' | 'iVs' | 'eVs' | 'stats'
    | 'hiddenPowerType' | 'hiddenPowerCategory' | 'hiddenPowerPower' | 'ability' | 'moves'
    | 'tid' | 'originMetDate' | 'originMetLevel' | 'originMetLocation' | 'originTrainerGender' | 'originTrainerName'
    | 'heldItem' | 'canEdit' | 'isEnabled' | 'hasLoadError'
>
    & Pick<PkmLegalityDTO, 'movesLegality'>
    & {
        filepath?: string;
        version: GameVersion | null;
        saveId?: number;
        reports?: React.ReactNode;
        onRelease?: () => unknown;
        onSubmit: () => unknown;
        openFile?: () => unknown;
        extraContent?: React.ReactNode;
    };

export const StorageDetailsBase: React.FC<StorageDetailsBaseProps> = ({ filepath, saveId, reports, onRelease, onSubmit, openFile, extraContent, ...pkm }) => {
    const { t } = useTranslate();

    const formContext = StorageDetailsForm.useContext();
    const isMoveDragging = MoveContext.useValue().state.status === 'dragging';

    const staticData = useStaticData();
    const staticForms = staticData.species[ pkm.species ]?.forms[ pkm.context ];

    const navigate = Route.useNavigate();

    const formObj = staticForms?.[ pkm.form ] ?? staticForms?.[ 0 ];

    const speciesName = formObj?.name;

    return <DetailsCardContainer
        bgColor={getGameInfos(pkm.version, pkm.isEnabled).color}
        title={<StorageDetailsTitle
            isEnabled={pkm.isEnabled}
            filepath={filepath}
            version={pkm.version}
            showVersionName
            canEdit={pkm.canEdit}
            onRelease={onRelease}
            openFile={openFile}
        />}
        mainImg={pkm.isEnabled && <DetailsMainImg
            species={pkm.species}
            context={pkm.context}
            form={pkm.form}
            isFemale={pkm.gender == GenderType.Female}
            isShiny={pkm.isShiny}
            isEgg={pkm.isEgg}
            isShadow={pkm.isShadow}
            ball={pkm.ball}
            shinyPart={<>
                {pkm.isAlpha && <AlphaIcon />}

                {pkm.isShiny && <ShinyIcon
                    className={css({
                        margin: '0 -2px',
                    })}
                />}
            </>}
            genderPart={<Gender gender={pkm.gender} />}
        />}
        mainInfos={pkm.isEnabled && <StorageDetailsMainInfos
            idBase={pkm.idBase}
            pid={pkm.pid}
            species={pkm.species}
            speciesName={speciesName ?? ''}
            nickname={pkm.nickname}
            nicknameMaxLength={pkm.nicknameMaxLength}
            levelUpPercent={pkm.levelUpPercent}
            level={pkm.level}
            types={pkm.types}
            eggHatchCount={pkm.eggHatchCount}
        />}
        preContent={reports}
        content={pkm.isEnabled && <>
            {!!pkm.heldItem && <TextContainer>
                {t('details.held-item')} <span className={css({ color: theme.text.primary })}>{staticData.items[ pkm.heldItem ]?.name}</span> <ItemImg
                    item={pkm.heldItem}
                    size={24}
                    className={css({
                        verticalAlign: 'middle'
                    })}
                />
            </TextContainer>}

            <TextContainer noWrap>
                <TextStats
                    nature={pkm.nature}
                    ivs={pkm.iVs}
                    maxIv={staticData.versions[ pkm.version ?? -1 ]?.maxIV ?? 0}
                    evs={pkm.eVs}
                    maxEv={staticData.versions[ pkm.version ?? -1 ]?.maxEV ?? 0}
                    stats={pkm.stats}
                    hiddenPowerType={pkm.hiddenPowerType}
                    hiddenPowerPower={pkm.hiddenPowerPower}
                    hiddenPowerCategory={pkm.hiddenPowerCategory}
                />
            </TextContainer>

            <TextContainer>
                <TextMoves
                    saveId={saveId}
                    pkmId={pkm.id}
                    ability={pkm.ability}
                    moves={pkm.moves}
                    movesLegality={pkm.movesLegality}
                    generation={pkm.generation}
                    hiddenPowerType={pkm.hiddenPowerType}
                    hiddenPowerPower={pkm.hiddenPowerPower}
                    hiddenPowerCategory={pkm.hiddenPowerCategory}
                    friendship={pkm.friendship}
                />
            </TextContainer>

            <TextContainer>
                <TextOrigin
                    version={pkm.version}
                    tid={pkm.tid}
                    originTrainerName={pkm.originTrainerName}
                    originTrainerGender={pkm.originTrainerGender}
                    originMetDate={pkm.originMetDate}
                    originMetLocation={pkm.originMetLocation}
                    originMetLevel={pkm.originMetLevel}
                />
            </TextContainer>
        </>}
        extraContent={extraContent}
        onClose={() => navigate({
            search: {
                selected: undefined,
            }
        })}
        showFullDetails={!pkm.isEnabled || isMoveDragging
            ? false
            : (formContext.editMode ? true : undefined)}
        actions={formContext.editMode && <div className={css({
            display: 'flex',
            gap: 4
        })}>
            <Button
                onClick={() => formContext.cancel()}
                className={css({ flexGrow: 1 })}
            >
                {t('action.cancel')}
            </Button>

            <div className={css({ flexGrow: 1 })}>
                <ButtonWithConfirm
                    bgColor={theme.bg.primary}
                    onClick={onSubmit}
                    className={css({ flexGrow: 1 })}
                >
                    {t('action.submit')}
                </ButtonWithConfirm>
            </div>
        </div>}
    />;
};
