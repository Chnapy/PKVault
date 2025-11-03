import type React from 'react';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { SelectStringInput, type DataOption } from '../../ui/input/select-input';
import { theme } from '../../ui/theme';
import { StorageSelectAll } from '../storage-select-all';
import { useTranslate } from '../../translate/i18n';

export const StorageHeader: React.FC<{
    saveId?: number;
    gameLogo: React.ReactNode;
    boxId: number;
    boxPkmCount: number;
    boxSlotCount: number;
    totalPkmCount: number;
    boxesOptions: DataOption<string>[];
    onBoxChange: (value: string) => void;
    onPreviousBoxClick?: () => void;
    onNextBoxClick?: () => void;
    onSplitClick?: () => void;
    onClose?: () => void;
    children?: React.ReactNode;
}> = ({ saveId, gameLogo, boxId, boxPkmCount, boxSlotCount, totalPkmCount, boxesOptions, onBoxChange, onPreviousBoxClick, onNextBoxClick, onSplitClick, onClose, children }) => {
    const { t } = useTranslate();

    return <>
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

            <SelectStringInput
                data={boxesOptions}
                value={boxId.toString()}
                onChange={onBoxChange}
            />

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

            {onClose && <Button
                onClick={onClose}
            >
                <Icon name='times' forButton />
            </Button>}
        </div>
    </>;
};
