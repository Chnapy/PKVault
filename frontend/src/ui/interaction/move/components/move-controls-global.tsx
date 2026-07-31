import { useTranslate } from '../../../../translate/i18n';
import { useControls } from '../../controls/use-controls';
import { getBackControl } from '../../focus-controls/common-controls/back-controls';
import { useMoveContext } from '../context/use-move-context';
import { useDragUtils } from '../hooks/use-drag-utils';

export const MoveControlsGlobals: React.FC = () => {
    const { t } = useTranslate();

    const isDragging = useMoveContext().useMoveStore(s => s.state.status === 'dragging');
    const { stopDrag } = useDragUtils();

    useControls(
        'globals-move',
        false,
        1,
        [
            isDragging && getBackControl({
                label: t('storage.actions.cancel-move'),
                action: (e) => stopDrag(e),
            }),
        ],
        { enabled: isDragging },
    );

    return null;
};
