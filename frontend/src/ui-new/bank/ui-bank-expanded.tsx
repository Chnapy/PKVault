import { ActionIcon, Button, Divider, Flex, Group, NumberFormatter, Popover, Stack, Tabs, Text } from '@mantine/core';
import { BoxIcon, PenIcon, TrashIcon } from 'lucide-react';
import type React from 'react';
import { UIBallIcon } from '../icon/ui-ball-icon';

export type UIBankData = {
    id: string;
    label: string;
    boxCount: number;
    pkmCount: number;
};

type UIBankExpandedProps = UIBankData & {
    selected?: boolean;
    onSelect: () => void;
    onDelete: () => void;
};

export const UIBankExpanded: React.FC<UIBankExpandedProps> = ({
    id, label, boxCount, pkmCount,
    selected, onSelect, onDelete,
}) => {
    return <Group gap='xs'>
        <Tabs.Tab
            color='primary.6'
            value={id}
            py='md'
            onClick={onSelect}
        >
            <Stack>
                <Text lh={1}>
                    {label}
                </Text>
                <Text component='div' lh={1}>
                    <Group align='center'>
                        <Flex gap='sm'>
                            <BoxIcon />
                            <NumberFormatter value={boxCount} />
                        </Flex>
                        <Divider orientation='vertical' />
                        <Flex gap='sm'>
                            <UIBallIcon />
                            <NumberFormatter value={pkmCount} />
                        </Flex>
                    </Group>
                </Text>
            </Stack>
        </Tabs.Tab>

        <ActionIcon.Group orientation="vertical">
            <ActionIcon color='blue'>
                <PenIcon />
            </ActionIcon>

            <Popover withArrow position='right-start'>
                <Popover.Target>
                    <ActionIcon color='red' disabled={selected} opacity={selected ? 0.5 : undefined}>
                        <TrashIcon />
                    </ActionIcon>
                </Popover.Target>

                <Popover.Dropdown>
                    <Button
                        variant='outline'
                        color='red'
                        onClick={onDelete}
                    >
                        Confirm
                    </Button>
                </Popover.Dropdown>
            </Popover>
        </ActionIcon.Group>
    </Group>;
};
