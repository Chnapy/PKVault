import type React from 'react';
import shinyIconImg from '../../assets/pkhex/img/Pokemon Sprite Overlays/rare_icon.png';
import { useStaticData } from '../../hooks/use-static-data';
import { Icon } from '../icon/icon';
import { TextContainer } from '../text-container/text-container';
import { theme } from '../theme';
import { SaveCardContentSmall, type SaveCardContentSmallProps } from './save-card-content-small';

export type SaveCardContentFullProps = SaveCardContentSmallProps & {
    playTime: string;
    dexSeenCount: number;
    dexCaughtCount: number;
    ownedCount: number;
    shinyCount: number;
    actions?: React.ReactNode;
};

export const SaveCardContentFull: React.FC<SaveCardContentFullProps> = ({
    id,
    generation,
    version,
    lastWriteTime,
    tid,
    trainerName,
    trainerGenderMale,
    playTime,
    dexSeenCount,
    dexCaughtCount,
    ownedCount,
    shinyCount,
    actions,
}) => {
    const staticData = useStaticData();

    return (
        <div
            style={{
                display: "flex",
                flexDirection: 'column',
                borderRadius: 8,
                // padding: 4,
                background: theme.bg.info,
                // alignItems: "flex-start",
                textAlign: 'left',
            }}
        >
            <SaveCardContentSmall
                id={id}
                generation={generation}
                version={version}
                lastWriteTime={lastWriteTime}
                tid={tid}
                trainerName={trainerName}
                trainerGenderMale={trainerGenderMale}
            />

            <div
                style={{
                    flexGrow: 1,
                    padding: 4,
                    paddingTop: 0
                }}
            >
                <TextContainer>
                    Time played <Icon name='clock' solid forButton /> <span style={{ color: theme.text.primary }}>{playTime}</span>
                    <br />
                    Pokedex seen <Icon name='eye' solid forButton /> <span style={{ color: theme.text.primary }}>{dexSeenCount}</span>{' '}
                    caught <img src={staticData.itemPokeball.sprite} style={{ height: '1lh', margin: -4 }} /> <span style={{ color: theme.text.primary }}>{dexCaughtCount}</span>
                    <br />
                    Storage <Icon name='folder' solid forButton /> <span style={{ color: theme.text.primary }}>{ownedCount}</span>
                    {shinyCount > 0 && <>
                        {' '} <img src={shinyIconImg} style={{ height: 16, margin: -4 }} /> <span style={{ color: theme.text.primary }}>{shinyCount}</span>
                    </>}

                    {actions && (
                        <span style={{ position: "absolute", right: -5, bottom: 0, display: 'flex', gap: 4 }}>
                            {actions}
                        </span>
                    )}
                </TextContainer>
            </div>
        </div>
    );
};
