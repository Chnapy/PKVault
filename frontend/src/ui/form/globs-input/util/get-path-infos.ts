import type { DefaultMantineColor, StyleProp } from '@mantine/core';
import { FileMinusIcon, FilePlusIcon, FolderMinusIcon, FolderPlusIcon, MinusIcon, PlusIcon, type LucideIcon } from 'lucide-react';

export type UIGlobType = 'file' | 'folder' | 'file-folder' | 'exclude';

type PathInfos = {
    type: UIGlobType;
    Symbol: LucideIcon;
    Icon: LucideIcon;
    color: StyleProp<DefaultMantineColor>;
};

export const getPathInfos = (path: string): PathInfos => {
    const isGlob = path.includes('*');
    const isDirectory = isGlob || path.endsWith('/');
    const isExclude = path.startsWith('!');

    return isExclude
        ? {
            type: 'exclude',
            Symbol: MinusIcon,
            Icon: isDirectory ? FolderMinusIcon : FileMinusIcon,
            color: 'red',
        }
        : {
            type: isDirectory ? 'folder' : 'file',
            Symbol: PlusIcon,
            Icon: isDirectory ? FolderPlusIcon : FilePlusIcon,
            color: 'blue',
        };
};

export const getDesktopFileTypeInfos = (type: UIGlobType): {
    id: number;
    directoryOnly: boolean;
    getFinalPaths: (values: string[]) => string[];
} => {
        if (type === 'file')
            return {
                id: -1,
                directoryOnly: false,
                getFinalPaths: (values: string[]) => values,
            };

        if (type === 'folder')
            return {
                id: -2,
                directoryOnly: true,
                getFinalPaths: (values: string[]) => values.map(path => path.endsWith('/') ? path : path + '/'),
            };

        return {
            id: -3,
            directoryOnly: false,
            getFinalPaths: (values: string[]) => values,
        };
    };
