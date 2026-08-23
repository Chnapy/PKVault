
export const PathUtil = {
    isDirectory: (path: string) => path.endsWith('/'),
    isGlob: (path: string) => path.includes('*'),
    isExclude: (path: string) => path[0] === '!',
    isAbsolute: (path: string) => path[0] === '/' || path[1] === ':',
    isRoot: (path: string) => path === '/' || (path.length === 3 && path[1] === ':'),
    isLAN: (path: string) => path.startsWith('\\\\'),

    asDirectory: (value: string) => PathUtil.isDirectory(value)
        ? value
        : value + '/',

    normalizePath: (path: string) => path.trim()
        .replaceAll('\\', '/')
        .replaceAll("//", "\\\\")
        .replaceAll("/./", "/"),

    // /toto/tata/ -> /toto/
    // /toto/tata -> /toto/
    // ./ -> ../
    getParentDirectory: (path: string) => {
        const valueParts = path.split('/');
        if (valueParts[ valueParts.length - 1 ] === '')
            valueParts.pop();

        if (valueParts[ valueParts.length - 1 ] === '..') {
            valueParts.push('..');
        } else {
            valueParts.pop();
        }
        valueParts.push('');

        let nextValue = valueParts.join('/');
        if (nextValue.trim() === '')
            nextValue = '../';
        return nextValue;
    },

    getDirectoryName: (path: string) => {
        const pathParts = path.split('/');
        return pathParts[ pathParts.length - 2 ] ?? '';
    },

    getFileName: (path: string) => {
        const pathParts = path.split('/');
        return pathParts.pop() ?? '';
    },

    getFileExt: (path: string) => {
        const nameParts = PathUtil.getFileName(path).split('.');
        if (nameParts.length < 2)
            return '';
        return nameParts.pop()!;
    },

    combine: (from: string, to: string) => {
        if (PathUtil.isAbsolute(to))
            return to;

        const fromParts = from.split('/');
        if (fromParts[fromParts.length - 1] === '')
            fromParts.pop();
        const toParts = to.split('/');

        for (const toEl of toParts) {
            switch (toEl) {
                case '.': break;
                case '..':
                    if (fromParts.pop() === '')
                        fromParts.pop();
                    break;
                default:
                    if (toEl !== '' || fromParts[ fromParts.length - 1 ] !== '')
                        fromParts.push(toEl);
                    break;
            }
        }

        return fromParts.join('/');
    },

    getValueDirectoryPath: (value: string) => {
        let valueParts = PathUtil.normalizePath(value).split('/');

        const asteriskIndex = valueParts.findIndex(p => p.includes('*'));
        if (asteriskIndex > -1) {
            valueParts = valueParts.slice(0, asteriskIndex);
            valueParts.push('');
        }

        valueParts[ valueParts.length - 1 ] = '';

        return valueParts.join('/');
    },
};
