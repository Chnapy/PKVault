import { Group, Text } from '@mantine/core';
import { AlertCircleIcon, PlusIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIButton } from '../../../form/button/ui-button';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';

export type UIDetailsSaveData = {
    id: string;
    label: string;
    imgSrc: string;
};

type UIDetailsSaveExpandedProps = UIDetailsSaveData & {
    create?: boolean;
    isMain?: boolean;
    isEnabled?: boolean;
    warning?: boolean;
    selected?: boolean;
    onSelect: () => unknown;
};

export const UIDetailsSaveExpanded: React.FC<UIDetailsSaveExpandedProps> = ({ id, label, imgSrc, create, isMain, isEnabled = true, warning, selected, onSelect }) => {
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
            {!isEnabled && <AlertCircleIcon />}
            {warning && isEnabled && <UIPokedexIcons.Warn size='xs' />}
        </Group>
    </UIButton>;
};
