import { Tooltip } from '@mantine/core';
import classes from './ui-path-line.module.css';

export const UIPathLine: React.FC<{ children: string }> = ({ children }) => {
    const parts = children.split('/');
    const filename = parts.pop();
    const directory = parts.pop();

    const firstPartsStr = parts.join('/');

    return <Tooltip label={children}>
        <span className={classes.uiPathLine}>
            {firstPartsStr && <>
                <span
                    className={classes.firstPart}
                    style={{
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
