import { Button, Divider, Group, Image, Stack, Text } from '@mantine/core';
import { PenIcon } from 'lucide-react';
import type React from 'react';
import { UIPathLine } from '../../../path/ui-path-line';
import { UIPopover } from '../../../popover/ui-popover';

export type UIGameExpandedWrapperProps = {
    selected?: boolean;
    onSelect: () => void;
    editDropdown?: React.ReactNode;

    title?: string;
    label: React.ReactNode;
    imgSrc: string;
    secondaryLine: React.ReactNode;
    tertiaryLine: React.ReactNode;
    path: string;
};

export const UIGameExpandedWrapper: React.FC<UIGameExpandedWrapperProps> = ({
    title, label, imgSrc, secondaryLine, tertiaryLine, path,
    selected, onSelect, editDropdown,
}) => {
    return <Group w={290} gap='xs' align='flex-start' wrap='nowrap'>

        <Stack gap='xs'>
            <Image
                src={imgSrc}
                w={44}
                radius='md'
            />

            {editDropdown && <UIPopover
                dropdown={editDropdown}
            >
                <Button
                    variant='filled'
                    color='blue'
                    size='compact-xs'
                >
                    <PenIcon />
                </Button>
            </UIPopover>}
        </Stack>

        <Button
            variant='default'
            disabled={selected}
            onClick={onSelect}
            title={title}
            h='auto'
            style={{ flexGrow: 1 }}
        >
            <Stack w='100%' align='stretch' gap={0}>
                <Text>
                    {label}
                </Text>

                <Divider my='xs' />

                <Text>
                    {secondaryLine}
                </Text>

                <Group
                    component={Text}
                    gap='sm'
                    wrap='nowrap'
                    mx='auto'
                    style={{
                        textWrap: 'nowrap',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {tertiaryLine}
                </Group>

                <Divider my='xs' />

                <Text>
                    <UIPathLine style={{ maxWidth: 200 }}>{path}</UIPathLine>
                </Text>
            </Stack>
        </Button>
    </Group>;
};
