import { Card, Group, Slider, Stack, Text, Tooltip } from '@mantine/core';
import { ScalingIcon } from 'lucide-react';
import React from 'react';
import { switchUtil } from '../../../../util/switch-util';
import { UIButton, type UIButtonProps } from '../../../form/button/ui-button';
import { useSpriteSizeLocalStorage, type SpriteSizeLocalStorageKey } from '../../../local-storage/use-storage-size-local-storage';
import { UIPopover } from '../../../popover/ui-popover';
import { UICardSectionControl } from '../../../storage/storage-panel/card-section-control/ui-card-section-control';

type UISpriteSizingButtonProps = {
    localStorageKey: SpriteSizeLocalStorageKey;
} & Partial<UIButtonProps>;

const getCtxName = (localStorageKey: SpriteSizeLocalStorageKey) => switchUtil(localStorageKey, {
    'storage-sprite-size': 'storage',
    'pokedex-sprite-size': 'pokedex',
});

export const UISpriteSizingButton: React.FC<UISpriteSizingButtonProps> = ({ localStorageKey, ...rest }) => {
    const [ rawValue ] = useSpriteSizeLocalStorage(localStorageKey);
    const value = rawValue * 100;

    return <UIPopover
        dropdown={<DropdownContent
            localStorageKey={localStorageKey}
        />}
    >
        <Tooltip label={`Change sprite size on ${getCtxName(localStorageKey)}`}>
            <UIButton
                name='sprite-sizing'
                controlLabel=''
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
    const [ rawValue, setRawValue ] = useSpriteSizeLocalStorage(localStorageKey);
    const value = rawValue * 100;
    const setValue = (value: number) => React.startTransition(() => setRawValue(value / 100));

    const marks = [
        25,
        50,
        75,
        100,
        125,
        150,
        175,
        200,
    ];

    return <Card
        miw={400}
        style={{
            position: 'initial',
            overflow: 'initial',
        }}
    >
        <Card.Section component={UICardSectionControl} inheritPadding withBorder py='sm'>
            <Group gap='sm'>
                <ScalingIcon />
                <Text size='lg'>
                    Sprite sizing for {getCtxName(localStorageKey)}
                </Text>
            </Group>
        </Card.Section>
        <Card.Section inheritPadding withBorder py='md' mih={0} mah='100%'>
            <Stack mih={0} mah='100%'>
                <Slider
                    color="blue"
                    value={value}
                    onChange={setValue}
                    min={25}
                    max={200}
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
