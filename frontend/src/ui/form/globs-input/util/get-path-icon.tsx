import { AsteriskIcon, FileIcon, FolderIcon, FolderRootIcon, NetworkIcon, SaveIcon, UploadIcon } from 'lucide-react';
import { UIBallIcon } from '../../../icon/ui-ball-icon';
import { PathUtil } from './path-util';

const saveExts = new Set([ 'sav', 'dsv', 'dat', 'gci', 'srm', 'fla', 'bin' ]);
const pkmExts = new Set([ 'pk', 'ck3', 'xk3', 'pb7', 'sk2', 'bk4', 'rk4', 'pa8', 'pb8', 'pa9' ]);

export const getPathIcon = (path: string, active?: boolean, pkvaultPath?: string, uploadPath?: string) => {
    const defaultColor = PathUtil.isExclude(path) ? 'var(--mantine-color-red-6)' : undefined;
    // if (PathUtil.isExclude(path))
    //     return PathUtil.isDirectory(path)
    //         ? <FolderMinusIcon color='var(--mantine-color-red-6)' />
    //         : <FileMinusIcon color='var(--mantine-color-red-6)' />;

    if (PathUtil.isGlob(path))
        return <AsteriskIcon color={defaultColor} />;

    if (PathUtil.isRoot(path))
        return <FolderRootIcon color={defaultColor} />;

    if (PathUtil.isLAN(path))
        return <NetworkIcon color={defaultColor} />;

    if (pkvaultPath && PathUtil.combine(pkvaultPath, path) === pkvaultPath)
        return <img src='/logo.svg' height={16} color={defaultColor} />

    if (uploadPath && path === uploadPath)
        return <UploadIcon color={defaultColor} />

    // console.log(path, pkvaultPath, PathUtil.combine(pkvaultPath, path));

    if (PathUtil.isDirectory(path))
        return <FolderIcon color={active ? defaultColor : defaultColor ?? 'var(--mantine-color-yellow-9)'} />;

    const filename = PathUtil.getFileName(path).toLowerCase();
    const ext = PathUtil.getFileExt(path).toLowerCase();

    const isSaveFile = filename === 'main' || saveExts.has(ext);
    if (isSaveFile)
        return <SaveIcon color={active ? defaultColor : defaultColor ?? 'var(--mantine-color-primary-6)'} />

    const isPkmFile = (ext.length === 3 && ext.startsWith('pk')) || pkmExts.has(ext);
    if (isPkmFile)
        return <UIBallIcon color={active ? defaultColor : defaultColor ?? 'var(--mantine-color-primary-6)'} />;

    return <FileIcon color={defaultColor} />;
};
