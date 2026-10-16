import { Group, Text } from '@mantine/core';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIButton } from '../../../form/button/ui-button';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';
import type { UIDetailsSaveTabProps } from './ui-details-save-tab';

export type UIDetailsSaveData = {
    id: string;
    label: string;
    imgSrc: string;
};

type UIDetailsSaveExpandedProps = UIDetailsSaveData
    & Pick<UIDetailsSaveTabProps, 'create' | 'isMain' | 'isEnabled' | 'selected' | 'attached' | 'warning'>
    & {
        onSelect: () => unknown;
    };

export const UIDetailsSaveExpanded: React.FC<UIDetailsSaveExpandedProps> = ({ id, label, imgSrc, create, isMain, isEnabled = true, attached, warning, selected, onSelect }) => {
    const { t } = useTranslate();

    return <UIButton
        name={'details-save-' + id}
        controlLabel={t('action.select')}
        variant='default'
        size='compact-md'
        leftSection={<Group gap='xs' wrap='nowrap'>
            {create && <PlusIcon />}
            <img src={imgSrc} height={16} />
        </Group>}
        selected={selected}
        onClick={onSelect}
    >
        <Group gap='xs' wrap='nowrap'>
            <Text component={selected ? 'b' : undefined} td={isMain ? 'underline' : undefined}>{label}</Text>
            {attached && <UIPokedexIcons.Attached size='xs' />}
            {!isEnabled && <AlertCircleIcon />}
            {warning && isEnabled && <UIPokedexIcons.Warn size='xs' />}
        </Group>
    </UIButton>;
};
