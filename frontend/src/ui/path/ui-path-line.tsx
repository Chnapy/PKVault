import { Tooltip } from '@mantine/core';
import classes from './ui-path-line.module.css';

export const UIPathLine: React.FC<Omit<React.ComponentProps<'span'>, 'children'> & { children: string }> = ({ children, ...rest }) => {
    const parts = children.split('/');
    const filename = parts.pop();
    const directory = parts.pop();

    const firstPartsStr = parts.join('/');

    return <Tooltip label={children}>
        <span className={classes.uiPathLine} {...rest}>
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
