import { Skeleton, type SkeletonProps } from '@mantine/core';
import { clsx } from 'clsx';
import type React from 'react';
import classes from './ui-species-img.module.css';

export const UISpeciesImgSkeleton: React.FC<SkeletonProps> = (props) => {
    return <Skeleton
        {...props}
        className={clsx(
            classes.uiSpeciesImg,
            classes.uiSpeciesImgSkeleton,
            props.className,
        )}
    />;
};
