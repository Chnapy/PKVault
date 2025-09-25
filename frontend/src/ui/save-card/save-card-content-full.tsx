import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { useStaticData } from '../../hooks/use-static-data';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
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
    onClose?: () => void;
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
    onClose,
}) => {
    const staticData = useStaticData();

    return (
        <div
            style={{
                position: 'relative',
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
                }}
            >
                <TextContainer>
                    Time played <Icon name='clock' solid forButton /> <span style={{ color: theme.text.primary }}>{playTime}</span>
                    <br />
                    Pokedex seen <Icon name='eye' solid forButton /> <span style={{ color: theme.text.primary }}>{dexSeenCount}</span>{' '}
                    caught <img src={getApiFullUrl(staticData.itemPokeball.sprite)} style={{ height: '1lh', width: '1lh', margin: -4 }} /> <span style={{ color: theme.text.primary }}>{dexCaughtCount}</span>
                    <br />
                    Storage <Icon name='folder' solid forButton /> <span style={{ color: theme.text.primary }}>{ownedCount}</span>
                    {shinyCount > 0 && <>
                        {' '} <ShinyIcon style={{ height: 16, margin: -4 }} /> <span style={{ color: theme.text.primary }}>{shinyCount}</span>
                    </>}

                    {actions && (
                        <span style={{ position: "absolute", right: -5, bottom: 0, display: 'flex', gap: 4 }}>
                            {actions}
                        </span>
                    )}
                </TextContainer>
            </div>

            {onClose && <Button style={{
                position: 'absolute',
                top: 0,
                right: 0,
            }}>
                <Icon name='times' forButton onClick={onClose} />
            </Button>}
        </div>
    );
};
