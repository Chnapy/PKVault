import { Card, Group, Slider, Stack, Text, Tooltip, useMatches } from '@mantine/core';
import { ScalingIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { switchUtil } from '../../../../util/switch-util';
import { UIButton, type UIButtonProps } from '../../../form/button/ui-button';
import { useSpriteSizeLocalStorage, type SpriteSizeLocalStorageKey } from '../../../local-storage/use-storage-size-local-storage';
import { UIPopover } from '../../../popover/ui-popover';
import { UICardSectionControl } from '../../../storage/storage-panel/card-section-control/ui-card-section-control';

type UISpriteSizingButtonProps = {
    localStorageKey: SpriteSizeLocalStorageKey;
} & Partial<UIButtonProps>;

export const UISpriteSizingButton: React.FC<UISpriteSizingButtonProps> = ({ localStorageKey, ...rest }) => {
    const { t } = useTranslate();

    const hidden = useMatches({
        base: true,
        lg: false,
    });

    const [ rawValue ] = useSpriteSizeLocalStorage(localStorageKey);
    const value = rawValue * 100;

    const label = switchUtil(localStorageKey, {
        'storage-sprite-size': t('header.sub.sprite-sizing.storage'),
        'pokedex-sprite-size': t('header.sub.sprite-sizing.dex'),
    });

    if (hidden)
        return null;

    return <UIPopover
        dropdown={<DropdownContent
            localStorageKey={localStorageKey}
        />}
    >
        <Tooltip label={label}>
            <UIButton
                name='sprite-sizing'
                controlLabel={label}
                variant='filled'
                color='primary'
                size='compact-sm'
                h={24}
                leftSection={<ScalingIcon />}
                {...rest}
            >
                {value}%
            </UIButton>
        </Tooltip>
    </UIPopover>;
};

const DropdownContent: React.FC<Pick<UISpriteSizingButtonProps, 'localStorageKey'>> = ({ localStorageKey }) => {
    const { t } = useTranslate();

    const [ rawValue, setRawValue ] = useSpriteSizeLocalStorage(localStorageKey);
    const value = rawValue * 100;
    const setValue = (value: number) => React.startTransition(() => setRawValue(value / 100));

    const marks = [
        // 25,
        // 50,
        // 75,
        100,
        125,
        150,
        175,
        200,
    ];

    return <Card
        miw={300}
        style={{
            position: 'initial',
            overflow: 'initial',
        }}
    >
        <Card.Section component={UICardSectionControl} inheritPadding withBorder py='sm'>
            <Group gap='sm'>
                <ScalingIcon />
                <Text size='lg'>
                    {switchUtil(localStorageKey, {
                        'storage-sprite-size': t('header.sub.sprite-sizing.title.storage'),
                        'pokedex-sprite-size': t('header.sub.sprite-sizing.title.dex'),
                    })}
                </Text>
            </Group>
        </Card.Section>
        <Card.Section inheritPadding withBorder py='md' mih={0} mah='100%'>
            <Stack mih={0} mah='100%'>
                <Slider
                    color="blue"
                    value={value}
                    onChange={setValue}
                    min={marks[ 0 ]}
                    max={marks[ marks.length - 1 ]}
                    marks={marks.map(value => ({
                        value,
                        label: `${value}%`,
                    }))}
                    label={null}
                    restrictToMarks
                    pt={4}
                    pb={24}
                />
            </Stack>
        </Card.Section>
    </Card>;
};
