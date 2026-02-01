import { css } from '@emotion/css';

export const PathLine: React.FC<{ children: string }> = ({ children }) => {
    const parts = children.split('/');
    const filename = parts.pop();
    const directory = parts.pop();

    const firstPartsStr = parts.join('/');

    return <div
        title={children}
        className={css({
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
        })}
    >
        {firstPartsStr && <>
            <div
                className={css({
                    opacity: 0.5,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    minWidth: 10,
                })}
            >
                {firstPartsStr}
            </div>/
        </>}
        {directory && <div>
            {directory}/
        </div>}
        {filename}
    </div>;
};
