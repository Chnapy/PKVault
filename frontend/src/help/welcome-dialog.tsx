import { Card, Group, Modal, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { InfoIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../translate/i18n';
import { UIButton } from '../ui/form/button/ui-button';
import { useControls } from '../ui/interaction/controls/use-controls';
import { getBackControl } from '../ui/interaction/focus-controls/common-controls/back-controls';
import { FocusScope } from '../ui/interaction/focus/scope/focus-scope';
import { useFocusScopeContext } from '../ui/interaction/focus/scope/use-focus-scope-context';
import { HelpDialogContent } from './help-dialog-content';
import { useHelpMenuItems } from './hooks/use-help-menu-items';

export const WelcomeDialog: React.FC = () => {
    const { t } = useTranslate();

    const [ welcomeOpened, setWelcomeOpened ] = useLocalStorage<boolean>({
        key: 'welcome-opened',
        defaultValue: true,
    });

    const onClose = () => setWelcomeOpened(false);

    return (
        <Modal
            opened={welcomeOpened}
            keepMounted={false}
            onClose={onClose}
            size='xl'
            title={<Group gap='sm'>
                <InfoIcon />
                <Text size='xl'>
                    {t('welcome.title')}
                </Text>
            </Group>}
        >
            <WelcomeDialogInner onClose={onClose} />
        </Modal>
    );
};

const WelcomeDialogInner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslate();

    const { language, menuItems } = useHelpMenuItems();

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const { controlProps } = useControls(
        'welcome-dialog',
        true,
        order + 1,
        [
            getBackControl({
                label: t('action.back'),
                action: onClose,
            }),
        ],
        { enabled: true },
    );

    const menuItem = menuItems.find(item => item.endPath === 'README.md');

    const selectedEndPath = menuItem?.endPath;

    const finalSelectedPath = `/docs/${language}/${selectedEndPath}`;

    return <FocusScope id='welcome-dialog' focusOnMount>
        <Stack {...controlProps('back')}>
            <Card>
                {t('welcome.head.1')}
                <br />{t('welcome.head.2')}
                <br />{t('welcome.head.3')}
            </Card>

            <HelpDialogContent
                selectedEndPath={selectedEndPath ?? ''}
                finalSelectedPath={finalSelectedPath}
                titleReduce={2}
            />

            <UIButton
                name='welcome-dialog-start'
                controlLabel={t('welcome.footer.play')}
                onClick={onClose}
                fullWidth
            >
                {t('welcome.footer.play')}
            </UIButton>
        </Stack>
    </FocusScope>;
};
