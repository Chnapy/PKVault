import { MoveIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIButton, type UIButtonProps } from '../../../ui/form/button/ui-button';
import { useControlsCurrentType } from '../../../ui/interaction/controls/use-controls-current-type';
import { type UseDraggingReturn } from '../../../ui/interaction/move/hooks/use-dragging';

export type MoveButtonProps = Pick<UIButtonProps, 'focusOnMount'>
    & Pick<UseDraggingReturn, 'ref' | 'useDrag'>;

export const MoveButton: React.FC<MoveButtonProps> = ({ ref, useDrag, focusOnMount }) => {
    const { t } = useTranslate();

    const draggingMove = useDrag();

    const controlsType = useControlsCurrentType();

    const onClickMove: UIButtonProps[ 'onClick' ] = controlsType === 'mouse'
        ? draggingMove.toggleDragByClick
        : draggingMove.toggleDragByFocus;

    return <UIButton
        ref={ref}
        name='move'
        controlLabel='Move'
        onClick={onClickMove}
        size='compact-md'
        leftSection={<MoveIcon />}
        disabled={!draggingMove.enabled}
        focusOnMount={focusOnMount}
    >
        {t('storage.actions.move')}
    </UIButton>;
};
