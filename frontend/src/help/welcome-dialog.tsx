import { Card, Group, Modal, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { InfoIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../translate/i18n';
import { UIButton } from '../ui-new/form/button/ui-button';
import { useControls } from '../ui-new/interaction/controls/use-controls';
import { getBackControl } from '../ui-new/interaction/focus-controls/common-controls/back-controls';
import { FocusScope } from '../ui-new/interaction/focus/scope/focus-scope';
import { useFocusScopeContext } from '../ui-new/interaction/focus/scope/use-focus-scope-context';
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
                    First launch - Welcome !
                </Text>
            </Group>}
        >
            <WelcomeDialogInner onClose={onClose} />
        </Modal>
    );
};

const WelcomeDialogInner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { language, menuItems } = useHelpMenuItems();

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const { controlProps } = useControls(
        'welcome-dialog',
        true,
        order + 1,
        [
            getBackControl({
                label: 'Back',
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
                PKVault helps you manage your Pokemon games saves & data.
                <br />A save file is present as sample for testing the app, before adding your own saves & data.
                <br />I hope this app will answer your needs. Consider giving your feedback !
            </Card>

            <HelpDialogContent
                selectedEndPath={selectedEndPath ?? ''}
                finalSelectedPath={finalSelectedPath}
                titleReduce={2}
            />

            <UIButton
                name='welcome-dialog-start'
                controlLabel=''
                onClick={onClose}
                fullWidth
            >
                It's time to play !
            </UIButton>
        </Stack>
    </FocusScope>;
};
