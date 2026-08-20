
export const PathUtil = {
    withSeparatorEnd: (value: string) => value.endsWith('/')
        ? value
        : value + '/',

    normalizePath: (path: string) => path.trim().replaceAll('\\', '/'),

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

    getValueDirectoryPath: (value: string) => {
        let valueParts = value.split('/');

        const asteriskIndex = valueParts.findIndex(p => p.includes('*'));
        if (asteriskIndex > -1) {
            valueParts = valueParts.slice(0, asteriskIndex);
            valueParts.push('');
        }

        valueParts[ valueParts.length - 1 ] = '';

        return valueParts.join('/');
    },
};
