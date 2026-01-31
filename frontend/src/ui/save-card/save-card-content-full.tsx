import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { PathLine } from '../../settings/path-line';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../button/button';
import { ItemImg } from '../details-card/item-img';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { TextContainer } from '../text-container/text-container';
import { theme } from '../theme';
import { SaveCardContentSmall, type SaveCardContentSmallProps } from './save-card-content-small';

export type SaveCardContentFullProps = SaveCardContentSmallProps & {
    path: string;
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
    path,
    playTime,
    dexSeenCount,
    dexCaughtCount,
    ownedCount,
    shinyCount,
    actions,
    onClose,
}) => {
    const { t } = useTranslate();

    const staticData = useStaticData();

    return (
        <div
            style={{
                position: 'relative',
                display: "flex",
                flexDirection: 'column',
                borderRadius: 8,
                background: theme.bg.blue,
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
                    <PathLine>{path}</PathLine>
                    {t('save.time')} <Icon name='clock' solid forButton /> <span style={{ color: theme.text.primary }}>{playTime}</span>
                    <br />
                    {t('save.dex')} <Icon name='eye' solid forButton /> <span style={{ color: theme.text.primary }}>{dexSeenCount}</span>{' '}
                    <ItemImg item={staticData.itemPokeball.id} size={'1lh'} style={{ margin: -4 }} /> <span style={{ color: theme.text.primary }}>{dexCaughtCount}</span>
                    <br />
                    {t('save.storage')} <Icon name='folder' solid forButton /> <span style={{ color: theme.text.primary }}>{ownedCount}</span>
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

            {onClose && <Button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                }}>
                <Icon name='times' forButton />
            </Button>}
        </div>
    );
};
