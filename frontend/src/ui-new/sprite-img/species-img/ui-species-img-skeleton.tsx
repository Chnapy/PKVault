import { Box } from '@mantine/core';
import type React from 'react';
import classes from './ui-species-img.module.css';
import { clsx } from 'clsx';

export const UISpeciesImgSkeleton: React.FC = () => {
    return <Box className={clsx(
        classes.uiSpeciesImg,
        classes.uiSpeciesImgSkeleton
    )} />;
};
