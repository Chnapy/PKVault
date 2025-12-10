import { css, cx } from '@emotion/css';
import type React from 'react';
import { theme } from '../theme';

export const Gauge: React.FC<{
    className?: string;
    value: number; // 0-1
}> = ({ className, value }) => {
    const percentValue = value * 100;

    return <div
        title={`${(percentValue).toFixed(0)}%`}
        className={cx(css({
            flexGrow: 1,
            maxWidth: 60,
            height: 6,
            display: 'inline-flex',
            border: `1px solid ${theme.border.default}`,
            borderRadius: 2,
        }), className)}
    >
        <div
            className={css({
                height: '100%',
                backgroundColor: theme.bg.primary,
            })}
            style={{ width: `${percentValue}%` }}
        />
    </div>;
};
