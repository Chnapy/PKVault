import { useLocalStorage } from '@mantine/hooks';
import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
import type React from 'react';
import { useDesktopMessage } from '../../../../settings/globs-input/hooks/use-desktop-message';
import { useTranslate } from '../../../../translate/i18n';
import { UIButton, type UIButtonProps } from '../../../form/button/ui-button';

export const UIToggleFullscreen: React.FC<Partial<UIButtonProps>> = (props) => {
    const { t } = useTranslate();

    const desktopMessage = useDesktopMessage();

    const [ fullscreen, setFullscreen ] = useLocalStorage<boolean>({
        key: 'app-fullscreen',
        defaultValue: false,
    });

    if (!desktopMessage)
        return null;

    const label = t('header.sub.fullscreen');

    return <UIButton
        name='fullscreen'
        controlLabel={label}
        onClick={async () => {
            const response = await desktopMessage.toggleFullscreen({
                type: 'toggle-fullscreen',
                id: 1,
                fullscreen: !fullscreen,
            });
            setFullscreen(response.fullscreen);
        }}
        variant='filled'
        color='primary'
        size='compact-sm'
        h={24}
        leftSection={fullscreen ? <Minimize2Icon /> : <Maximize2Icon />}
        {...props}
    >
        {label}
    </UIButton>;
};
