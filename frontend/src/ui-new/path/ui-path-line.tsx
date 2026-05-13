import { Tooltip } from '@mantine/core';

export const UIPathLine: React.FC<{ children: string }> = ({ children }) => {
    const parts = children.split('/');
    const filename = parts.pop();
    const directory = parts.pop();

    const firstPartsStr = parts.join('/');

    return <Tooltip label={children}>
        <span
            style={{
                maxWidth: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
            }}
        >
            {firstPartsStr && <>
                <span
                    style={{
                        opacity: 0.5,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        minWidth: !firstPartsStr || firstPartsStr === '.' ? undefined : 10,
                    }}
                >
                    {firstPartsStr}
                </span>/
            </>}
            {directory && <span>
                {directory}/
            </span>}
            {filename}
        </span>
    </Tooltip>;
};
