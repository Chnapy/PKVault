import type React from 'react';
import { useTranslate } from '../../../../../translate/i18n';
import { useControls } from '../../../controls/use-controls';
import { Focus } from '../../../focus/provider/use-focus-context';
import { getBackControl } from '../../common-controls/back-controls';
import { getMoveControl } from '../../common-controls/move-controls';
import { getScrollControl } from '../../common-controls/scroll-controls';

export const ControlsGlobals: React.FC = () => {
    const { t } = useTranslate();

    const { popScope } = Focus.usePushPopScope();

    useControls(
        'globals',
        false,
        0,
        [
            getMoveControl({
                label: t('action.navigate'),
            }),
            getScrollControl({
                label: t('action.scroll'),
            }),
            getBackControl({
                label: t('action.back'),
                action: () => popScope(),
            }),
        ],
        { enabled: true },
    );

    return null;
};
