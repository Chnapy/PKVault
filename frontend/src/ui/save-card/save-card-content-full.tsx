import type React from 'react';
import { ButtonWithConfirm } from '../button/button-with-confirm';
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
                }}
            >
                <TextContainer>
                    Time played <span style={{ color: theme.text.primary }}>{playTime}</span>
                    <br />
                    Pokedex seen <span style={{ color: theme.text.primary }}>{dexSeenCount}</span> caught <span style={{ color: theme.text.primary }}>{dexCaughtCount}</span>
                    <br />
                    Storage <span style={{ color: theme.text.primary }}>{ownedCount}</span>
                    {shinyCount > 0 && <>
                        {' '}(<span style={{ color: theme.text.contrast }}>{shinyCount}</span>)
                    </>}

                    {actions && (
                        <span style={{ position: "absolute", right: 0, bottom: 0 }}>
                            {actions}
                        </span>
                    )}
                </TextContainer>
            </div>
        </div>
    );
};
