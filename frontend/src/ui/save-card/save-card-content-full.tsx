import type React from 'react';
import { theme } from '../theme';
import { SaveCardContentSmall, type SaveCardContentSmallProps } from './save-card-content-small';
import { TextContainer } from '../text-container/text-container';
import { css } from '@emotion/css';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { Button } from '../button/button';

export type SaveCardContentFullProps = SaveCardContentSmallProps & {
    playTime: string;
    dexSeenCount: number;
    dexCaughtCount: number;
    ownedCount: number;
    shinyCount: number;
    onDelete?: () => void;
};

export const SaveCardContentFull: React.FC<SaveCardContentFullProps> = ({
    id,
    generation,
    version,
    timestamp,
    tid,
    trainerName,
    trainerGenderMale,
    playTime,
    dexSeenCount,
    dexCaughtCount,
    ownedCount,
    shinyCount,
    onDelete,
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
                timestamp={timestamp}
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

                    {onDelete && (
                        <span style={{ position: "absolute", right: 0, bottom: 0 }}>
                            <Popover className="relative">
                                <Button as={PopoverButton} componentDescriptor="button">
                                    Delete
                                </Button>
                                <PopoverPanel
                                    anchor="bottom"
                                    className={css({ overflow: "unset !important" })}
                                >
                                    <Button onClick={onDelete}>Confirm ?</Button>
                                </PopoverPanel>
                            </Popover>
                        </span>
                    )}
                </TextContainer>
            </div>
        </div>
    );
};
