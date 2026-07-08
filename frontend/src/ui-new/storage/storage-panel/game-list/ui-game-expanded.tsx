import { Box, Divider } from '@mantine/core';
import { FolderIcon, TimerIcon } from 'lucide-react';
import type React from 'react';
import type { Gender } from '../../../../data/sdk/model';
import { UIGender } from '../../../icon/ui-gender';
import { UIGameExpandedWrapper, type UIGameExpandedWrapperProps } from './ui-game-expanded-wrapper';

export type UIGameExpandedProps = Pick<UIGameExpandedWrapperProps, 'selected' | 'onSelect' | 'editDropdown' | 'actions' | 'label' | 'imgSrc' | 'path'>
    & {
        id: string;
        generation: string;
        ot: string;
        otGender: Gender;
        tid: number;
        ownedCount: number;
        playTime: string;
        language: string;
    };

export const UIGameExpanded: React.FC<UIGameExpandedProps> = ({
    id, generation, label, ot, otGender, tid, ownedCount, playTime, language,
    ...rest
}) => {
    return <UIGameExpandedWrapper
        {...rest}
        title={id}
        label={<>
            <Box component='span' c='blue'>{generation}</Box> - {label}
        </>}
        secondaryLine={<>
            OT {ot} <UIGender gender={otGender} /> - TID {tid}
        </>}
        tertiaryLine={<>
            <FolderIcon /> {ownedCount}
            <Divider component='span' orientation='vertical' />
            <TimerIcon /> {playTime}
            <Divider component='span' orientation='vertical' />
            {language}
        </>}
    />;
};
