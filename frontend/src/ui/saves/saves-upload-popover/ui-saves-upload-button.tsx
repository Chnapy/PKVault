import { Tooltip } from '@mantine/core';
import { UploadIcon } from 'lucide-react';
import React from 'react';
import { useSettingsGet } from '../../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../../translate/i18n';
import { UIButton, type UIButtonProps } from '../../form/button/ui-button';
import { UIPopover } from '../../popover/ui-popover';

export type UISavesUploadButtonProps = Partial<UIButtonProps> & {
    dropdown: React.ReactNode;
    disabledLabel?: string;
};

export const UISavesUploadButton: React.FC<UISavesUploadButtonProps> = ({ dropdown, disabledLabel, ...btnProps }) => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;
    const disabled = !!settings && !settings.canScanSaves;

    const button = <UIButton
        name='add-upload'
        controlLabel={t('saves.upload.button')}
        variant='filled'
        leftSection={<UploadIcon />}
        {...btnProps}
        disabled={disabled || btnProps.disabled}
    >
        {t('saves.upload.button')}
    </UIButton>;

    if (disabledLabel && disabled)
        return <Tooltip label={disabledLabel} disabled={!disabledLabel || !disabled}>
            {button}
        </Tooltip>;

    return <UIPopover
        dropdown={dropdown}
        position='bottom-end'
        keepMounted
    >
        {button}
    </UIPopover>;
};
