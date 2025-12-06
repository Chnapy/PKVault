import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { StorageSelectAll } from '../storage-select-all';

export const StorageHeader: React.FC<{
    saveId?: number;
    gameLogo: React.ReactNode;
    boxId: number;
    boxName: string;
    boxPkmCount: number;
    boxSlotCount: number;
    totalPkmCount: number;
    showBoxes: boolean;
    onBoxesDisplay: () => void;
    onPreviousBoxClick?: () => void;
    onNextBoxClick?: () => void;
    onSplitClick?: () => void;
    onClose?: () => void;
    children?: React.ReactNode;
}> = ({ saveId, gameLogo, boxId, boxName, boxPkmCount, boxSlotCount, totalPkmCount, showBoxes, onBoxesDisplay, onPreviousBoxClick, onNextBoxClick, onSplitClick, onClose, children }) => {
    const { t } = useTranslate();

    return <div
        style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
        }}
    >
        {gameLogo}

        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
            }}
        >
            <Button
                onClick={onPreviousBoxClick}
                disabled={!onPreviousBoxClick}
            >
                <Icon name='angle-left' forButton />
            </Button>

            <Button onClick={onBoxesDisplay}>
                {boxName}

                <Icon name={showBoxes ? 'angle-up' : 'angle-down'} solid forButton />
            </Button>

            {children}

            <Button
                onClick={onNextBoxClick}
                disabled={!onNextBoxClick}
            >
                <Icon name='angle-right' forButton />
            </Button>
        </div>

        <div
            style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8
            }}
        >
            {!showBoxes && <>
                <StorageSelectAll saveId={saveId} boxId={boxId} />

                <div style={{ display: 'flex', gap: 2, whiteSpace: 'nowrap' }}>
                    <Icon name='folder' solid forButton />
                    <span style={{ color: theme.text.primary }}>{boxPkmCount}</span>
                    /{boxSlotCount} - {t('total')}.<span style={{ color: theme.text.primary }}>{totalPkmCount}</span>
                </div>

                {onSplitClick && <Button
                    onClick={onSplitClick}
                >
                    <Icon name='page-break' forButton title={t('storage.box.split.help')} style={{ transform: 'rotate(90deg) scale(1.2)' }} />
                </Button>}
            </>}

            {onClose && <Button
                onClick={onClose}
            >
                <Icon name='times' forButton />
            </Button>}
        </div>
    </div>;
};
