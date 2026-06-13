import { Divider } from '@mantine/core';
import { FolderIcon } from 'lucide-react';
import type React from 'react';
import { UIGameExpandedWrapper, type UIGameExpandedWrapperProps } from './ui-game-expanded-wrapper';

export type UIGamePkvaultExpandedProps = Pick<UIGameExpandedWrapperProps, 'selected' | 'onSelect' | 'label' | 'imgSrc' | 'path'>
    & {
        ownedCount: number;
        language: string;
    };

export const UIGamePkvaultExpanded: React.FC<UIGamePkvaultExpandedProps> = ({
    ownedCount, language,
    ...rest
}) => {
    return <UIGameExpandedWrapper
        {...rest}
        secondaryLine={<>
            Centralized storage
        </>}
        tertiaryLine={<>
            <FolderIcon /> {ownedCount}
            <Divider component='span' orientation='vertical' />
            {language}
        </>}
    />;
};
