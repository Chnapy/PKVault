import type React from 'react';
import type { PkmSaveDTO } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { Route } from '../../routes/storage';
import { Button } from '../button/button';
import { ButtonWithConfirm } from '../button/button-with-confirm';
import { DetailsCardContainer } from '../details-card/details-card-container';
import { TextContainer } from '../text-container/text-container';
import { theme } from '../theme';
import { StorageDetailsForm } from './storage-details-form';
import { StorageDetailsMainImg } from './storage-details-main-img';
import { StorageDetailsMainInfos } from './storage-details-main-infos';
import { StorageDetailsTitle } from './storage-details-title';
import { TextMoves } from './text-moves';
import { TextOrigin } from './text-origin';
import { TextStats } from './text-stats';
import { StorageMoveContext } from '../../storage/actions/storage-move-context';

export type StorageDetailsBaseProps = Pick<PkmSaveDTO,
    | 'id' | 'pid' | 'species' | 'speciesName' | 'version' | 'generation' | 'isShiny' | 'isEgg' | 'isShadow' | 'ball'
    | 'gender' | 'level' | 'nickname' | 'nicknameMaxLength' | 'types' | 'nature' | 'iVs' | 'eVs' | 'stats'
    | 'hiddenPowerType' | 'hiddenPowerCategory' | 'hiddenPowerPower' | 'ability' | 'moves' | 'availableMoves'
    | 'tid' | 'originMetDate' | 'originMetLevel' | 'originMetLocation' | 'originTrainerGender' | 'originTrainerName'
    | 'heldItem' | 'isValid' | 'validityReport'
> & {
    onRelease?: () => unknown;
    onSubmit?: () => unknown;
    extraContent?: React.ReactNode;
};

export const StorageDetailsBase: React.FC<StorageDetailsBaseProps> = ({ onRelease, onSubmit, extraContent, ...savePkm }) => {
    const formContext = StorageDetailsForm.useContext();
    const moveContext = StorageMoveContext.useValue();

    const staticData = useStaticData();

    const navigate = Route.useNavigate();

    return <DetailsCardContainer
        title={<StorageDetailsTitle
            version={savePkm.version}
            generation={savePkm.generation}
            showVersionName
            onRelease={onRelease}
        />}
        mainImg={
            <StorageDetailsMainImg
                species={savePkm.species}
                speciesName={savePkm.speciesName}
                isShiny={savePkm.isShiny}
                isEgg={savePkm.isEgg}
                isShadow={savePkm.isShadow}
                ball={savePkm.ball}
            />
        }
        mainInfos={
            <StorageDetailsMainInfos
                id={savePkm.id}
                pid={savePkm.pid}
                species={savePkm.species}
                speciesName={savePkm.speciesName}
                nickname={savePkm.nickname}
                nicknameMaxLength={savePkm.nicknameMaxLength}
                gender={savePkm.gender}
                level={savePkm.level}
                types={savePkm.types}
            />
        }
        preContent={<>
            {!savePkm.isValid && <TextContainer
                bgColor={theme.bg.yellow}
                maxHeight={200}
            >
                {savePkm.validityReport}
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
                {!!savePkm.heldItem && <TextContainer>
                    Held item <span style={{ color: theme.text.primary }}>{staticData.items[ savePkm.heldItem ].name}</span> <img
                        src={staticData.items[ savePkm.heldItem ].sprite}
                        alt={staticData.items[ savePkm.heldItem ].name}
                        style={{
                            height: 24,
                            verticalAlign: 'middle'
                        }} />
                </TextContainer>}

                <TextContainer noWrap>
                    <TextStats
                        nature={savePkm.nature}
                        ivs={savePkm.iVs}
                        evs={savePkm.eVs}
                        maxEv={staticData.versions[ savePkm.version ].maxEV}
                        stats={savePkm.stats}
                        hiddenPowerType={savePkm.hiddenPowerType}
                        hiddenPowerPower={savePkm.hiddenPowerPower}
                        hiddenPowerCategory={savePkm.hiddenPowerCategory}
                    />
                </TextContainer>

                <TextContainer>
                    <TextMoves
                        ability={savePkm.ability}
                        moves={savePkm.moves}
                        availableMoves={savePkm.availableMoves.map(am => am.id)}
                        generation={savePkm.generation}
                        hiddenPowerType={savePkm.hiddenPowerType}
                        hiddenPowerPower={savePkm.hiddenPowerPower}
                        hiddenPowerCategory={savePkm.hiddenPowerCategory}
                    />
                </TextContainer>

                <TextContainer>
                    <TextOrigin
                        version={savePkm.version}
                        tid={savePkm.tid}
                        originTrainerName={savePkm.originTrainerName}
                        originTrainerGender={savePkm.originTrainerGender}
                        originMetDate={savePkm.originMetDate}
                        originMetLocation={savePkm.originMetLocation}
                        originMetLevel={savePkm.originMetLevel}
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
                Cancel
            </Button>

            <div style={{ flexGrow: 1 }}>
                <ButtonWithConfirm
                    bgColor={theme.bg.primary}
                    onClick={onSubmit}
                    style={{ flexGrow: 1 }}
                >
                    Submit
                </ButtonWithConfirm>
            </div>
        </div>}
    />;
};
