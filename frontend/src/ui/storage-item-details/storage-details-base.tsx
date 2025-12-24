import type React from 'react';
import { Gender as GenderType, type PkmSaveDTO } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { Route } from '../../routes/storage';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';
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
    | 'id' | 'idBase' | 'pid' | 'species' | 'version' | 'context' | 'generation' | 'form' | 'isAlpha' | 'isShiny' | 'isEgg' | 'isShadow' | 'ball'
    | 'gender' | 'level' | 'levelUpPercent' | 'eggHatchCount' | 'friendship' | 'nickname' | 'nicknameMaxLength' | 'types' | 'nature' | 'iVs' | 'eVs' | 'stats'
    | 'hiddenPowerType' | 'hiddenPowerCategory' | 'hiddenPowerPower' | 'ability' | 'moves' | 'movesLegality'
    | 'tid' | 'originMetDate' | 'originMetLevel' | 'originMetLocation' | 'originTrainerGender' | 'originTrainerName'
    | 'heldItem' | 'isValid' | 'validityReport' | 'canEdit'
> & {
    saveId?: number;
    onRelease?: () => unknown;
    onSubmit: () => unknown;
    extraContent?: React.ReactNode;
};

export const StorageDetailsBase: React.FC<StorageDetailsBaseProps> = ({ saveId, onRelease, onSubmit, extraContent, ...pkm }) => {
    const { t } = useTranslate();

    const formContext = StorageDetailsForm.useContext();
    const moveContext = StorageMoveContext.useValue();

    const staticData = useStaticData();
    const staticForms = staticData.species[ pkm.species ]?.forms[ pkm.context ];

    const navigate = Route.useNavigate();

    const formObj = staticForms?.[ pkm.form ] ?? staticForms?.[ 0 ];

    const speciesName = formObj?.name;

    return <DetailsCardContainer
        bgColor={getGameInfos(pkm.version).color}
        title={<StorageDetailsTitle
            version={pkm.version}
            showVersionName
            canEdit={pkm.canEdit}
            onRelease={onRelease}
        />}
        mainImg={
            <DetailsMainImg
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
                        style={{
                            // width: 12,
                            margin: '0 -2px',
                        }}
                    />}
                </>}
                genderPart={<Gender gender={pkm.gender} />}
            />
        }
        mainInfos={
            <StorageDetailsMainInfos
                idBase={pkm.idBase}
                pid={pkm.pid}
                species={pkm.species}
                speciesName={speciesName ?? ''}
                nickname={pkm.nickname}
                nicknameMaxLength={pkm.nicknameMaxLength}
                // gender={pkm.gender}
                levelUpPercent={pkm.levelUpPercent}
                level={pkm.level}
                types={pkm.types}
                eggHatchCount={pkm.eggHatchCount}
            />
        }
        preContent={<>
            {!pkm.isValid && <TextContainer
                bgColor={theme.bg.yellow}
                maxHeight={200}
                style={{
                    minHeight: '1lh',
                    flexShrink: 0.1,
                }}
            >
                {pkm.validityReport}
            </TextContainer>}

            {/* {!!mainBoxId && !!mainBoxSlot && goToMainPkm && <>
                        <Button onClick={goToMainPkm}>
                            <div style={{ width: '100%' }}>
                                Go to main-pkm
                            </div>
                            <div style={{ width: '100%' }}>
                                Box {mainBoxId} slot {mainBoxSlot}
                            </div>
                            <div style={{ width: '100%', color: !saveSynchronized ? theme.text.contrast : undefined }}>
                                {saveSynchronized ? 'synchronized' : 'unsynchronized'}
                            </div>
                        </Button>
                    </>} */}
        </>}
        content={
            <>
                {!!pkm.heldItem && <TextContainer>
                    {t('details.held-item')} <span style={{ color: theme.text.primary }}>{staticData.items[ pkm.heldItem ]?.name}</span> <ItemImg
                        item={pkm.heldItem}
                        size={24}
                        style={{
                            verticalAlign: 'middle'
                        }}
                    />
                </TextContainer>}

                <TextContainer noWrap>
                    <TextStats
                        nature={pkm.nature}
                        ivs={pkm.iVs}
                        maxIv={staticData.versions[ pkm.version ]?.maxIV ?? 0}
                        evs={pkm.eVs}
                        maxEv={staticData.versions[ pkm.version ]?.maxEV ?? 0}
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
            </>
        }
        extraContent={extraContent}
        onClose={() => navigate({
            search: {
                selected: undefined,
            }
        })}
        showFullDetails={moveContext.selected
            ? false
            : (formContext.editMode ? true : undefined)}
        actions={formContext.editMode && <div style={{
            display: 'flex',
            gap: 4
        }}>
            <Button
                onClick={() => formContext.cancel()}
                style={{ flexGrow: 1 }}
            >
                {t('action.cancel')}
            </Button>

            <div style={{ flexGrow: 1 }}>
                <ButtonWithConfirm
                    bgColor={theme.bg.primary}
                    onClick={onSubmit}
                    style={{ flexGrow: 1 }}
                >
                    {t('action.submit')}
                </ButtonWithConfirm>
            </div>
        </div>}
    />;
};
