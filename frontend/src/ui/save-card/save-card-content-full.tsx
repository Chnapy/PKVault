import { css } from '@emotion/css';
import type React from 'react';
import type { LanguageID } from '../../data/sdk/model';
import { useStaticData } from '../../hooks/use-static-data';
import { PathLine } from '../../settings/path-line';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { ShinyIcon } from '../icon/shiny-icon';
import { BallImg } from '../img/ball-img';
import { TextContainer } from '../text-container/text-container';
import { theme } from '../theme';
import { SaveCardContentSmall, type SaveCardContentSmallProps } from './save-card-content-small';

export type SaveCardContentFullProps = SaveCardContentSmallProps & {
    path: string;
    playTime: string;
    language: LanguageID;
    dexSeenCount: number;
    dexCaughtCount: number;
    ownedCount: number;
    shinyCount: number;
    actions?: React.ReactNode;
    onClose?: () => void;
};

export const SaveCardContentFull: React.FC<SaveCardContentFullProps> = ({
    id,
    context,
    version,
    lastWriteTime,
    tid,
    sid,
    trainerName,
    trainerGender,
    path,
    playTime,
    language,
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
            className={css({
                position: 'relative',
                display: "flex",
                flexDirection: 'column',
                borderRadius: 8,
                background: theme.bg.blue,
                textAlign: 'left',
            })}
        >
            <SaveCardContentSmall
                id={id}
                context={context}
                version={version}
                lastWriteTime={lastWriteTime}
                tid={tid}
                sid={sid}
                trainerName={trainerName}
                trainerGender={trainerGender}
            />

            <div
                className={css({
                    flexGrow: 1,
                })}
            >
                <TextContainer>
                    <PathLine>{path}</PathLine>
                    {t('save.time')} <Icon name='clock' solid forButton /> <span className={css({ color: theme.text.primary })}>{playTime}</span>
                    <span className={css({ float: 'right' })}>
                        <span className={css({ color: theme.text.primary })}>{staticData.languages[ language ]}</span>
                    </span>
                    <br />
                    {t('save.dex')} <Icon name='eye' solid forButton /> <span className={css({ color: theme.text.primary })}>{dexSeenCount}</span>{' '}
                    <BallImg size={14} /> <span className={css({ color: theme.text.primary })}>{dexCaughtCount}</span>
                    <br />
                    {t('save.storage')} <Icon name='folder' solid forButton /> <span className={css({ color: theme.text.primary })}>{ownedCount}</span>
                    {shinyCount > 0 && <>
                        {' '} <ShinyIcon className={css({ height: 16, margin: -4 })} /> <span className={css({ color: theme.text.primary })}>{shinyCount}</span>
                    </>}

                    {actions && (
                        <span className={css({ position: "absolute", right: -5, bottom: 0, display: 'flex', gap: 4 })}>
                            {actions}
                        </span>
                    )}
                </TextContainer>
            </div>

            {onClose && <Button
                onClick={onClose}
                className={css({
                    position: 'absolute',
                    top: 0,
                    right: 0,
                })}>
                <Icon name='times' forButton />
            </Button>}
        </div>
    );
};
