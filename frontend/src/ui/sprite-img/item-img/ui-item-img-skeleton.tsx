import { Skeleton, type SkeletonProps } from '@mantine/core';
import { clsx } from 'clsx';
import type React from 'react';
import classes from './ui-item-img.module.css';

export const UIItemImgSkeleton: React.FC<SkeletonProps> = (props) => {
    return <Skeleton
        {...props}
        className={clsx(
            classes.uiItemImg,
            classes.uiItemImgSkeleton,
            props.className,
        )}
    />;
};
