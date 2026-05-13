import { Button, Group, Image, Stack, Text } from '@mantine/core';
import { PenIcon } from 'lucide-react';
import type React from 'react';
import type { Gender } from '../../../../data/sdk/model';
import { renderTimestamp } from '../../../../ui/util/render-date-time';
import { UIGender } from '../../../icon/ui-gender';
import { UIPathLine } from '../../../path/ui-path-line';

export type UIGameData = {
    id: string;
    label: string;
    imgSrc: string;
    ot: string;
    otGender: Gender;
    tid: number;
    lastSync: string;
    path: string;
};

type UIGameExpandedProps = UIGameData & {
    selected?: boolean;
    onSelect: () => void;
    // onEdit
};

export const UIGameExpanded: React.FC<UIGameExpandedProps> = ({
    id, label, imgSrc, ot, otGender, tid, lastSync, path,
    selected, onSelect,
}) => {
    return <Group gap='xs'>

        <Stack gap={0}>
            <Image
                src={imgSrc}
                h={44}
                radius='md'
            />

            <Button
                variant='filled'
                color='blue'
                size='compact-xs'
            >
                <PenIcon />
            </Button>
        </Stack>

        <Button
            variant='default'
            disabled={selected}
            h='auto'
            onClick={onSelect}
        >
            <Stack gap={0}>
                <Text component={selected ? 'b' : undefined}>{label}</Text>

                <Text>
                    OT {ot} <UIGender gender={otGender} /> - TID {tid}
                </Text>

                <Text>
                    Last sync {renderTimestamp(new Date(lastSync))}
                </Text>

                <Text>
                    <UIPathLine>{path}</UIPathLine>
                </Text>
            </Stack>
        </Button>
    </Group>;
};
