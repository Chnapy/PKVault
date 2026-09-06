import { ActionIcon, Code, CopyButton, Group, Modal, Stack, Text } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { CopyIcon, InfoIcon } from 'lucide-react';
import type React from 'react';
import type { SettingsDTO } from '../data/sdk/model';
import { useSettingsGet } from '../data/sdk/settings/settings.gen';
import { useTranslate } from '../translate/i18n';
import { UIButton } from '../ui/form/button/ui-button';
import { useControls } from '../ui/interaction/controls/use-controls';
import { getBackControl } from '../ui/interaction/focus-controls/common-controls/back-controls';
import { FocusScope } from '../ui/interaction/focus/scope/focus-scope';
import { useFocusScopeContext } from '../ui/interaction/focus/scope/use-focus-scope-context';

export const FlatpakMigrateDialog: React.FC = () => {
    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    return settings && <FlatpakMigrateDialogMainInner {...settings} />;
};

const FlatpakMigrateDialogMainInner: React.FC<SettingsDTO> = ({ flatpakMigrated }) => {
    const { t } = useTranslate();

    const [ flatpakOpened, setFlatpakOpened ] = useLocalStorage<boolean>({
        key: 'flatpak-migrate-opened',
        defaultValue: flatpakMigrated,
    });

    const onClose = () => setFlatpakOpened(false);

    return (
        <Modal
            opened={flatpakOpened}
            keepMounted={false}
            onClose={onClose}
            size='md'
            title={<Group gap='sm'>
                <InfoIcon />
                <Text size='xl'>
                    {t('flatpak-migrate.title')}
                </Text>
            </Group>}
        >
            <FlatpakMigrateDialogInner onClose={onClose} />
        </Modal>
    );
};

const FlatpakMigrateDialogInner: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useTranslate();

    const parentScope = useFocusScopeContext();
    const order = parentScope.parentsIds.length;

    const { controlProps } = useControls(
        'flatpak-dialog',
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

    return <FocusScope id='flatpak-dialog' focusOnMount>
        <Stack {...controlProps('back')}>
            <Text component='div'>

                {t('flatpak-migrate.1')} <Code>org.chnapy.pkvault</Code> {t('flatpak-migrate.2')} <Code>io.github.chnapy.pkvault</Code>.
                <br />{t('flatpak-migrate.3')}
                <br />
                <br />{t('flatpak-migrate.4')}
                <Code block p='md' my='md'>
                    flatpak uninstall org.chnapy.pkvault

                    <CopyButton value="flatpak uninstall org.chnapy.pkvault">
                        {({ copy }) => (
                            <ActionIcon color='gray' variant="subtle" size='xs' onClick={copy} style={{
                                verticalAlign: 'middle',
                                float: 'right',
                            }}>
                                <CopyIcon height={14} />
                            </ActionIcon>
                        )}
                    </CopyButton>
                </Code>
            </Text>

            <UIButton
                name='flatpak-dialog-start'
                controlLabel={t('action.close')}
                onClick={onClose}
                fullWidth
            >
                {t('action.close')}
            </UIButton>
        </Stack>
    </FocusScope>;
};
