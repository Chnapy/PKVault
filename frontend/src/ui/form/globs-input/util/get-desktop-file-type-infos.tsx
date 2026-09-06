import { PathUtil } from './path-util';

export type UIGlobType = 'file' | 'folder' | 'file-folder' | 'exclude';

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
            getFinalPaths: (values: string[]) => values.map(path => PathUtil.asDirectory(path)),
        };

    return {
        id: -3,
        directoryOnly: false,
        getFinalPaths: (values: string[]) => values,
    };
};
