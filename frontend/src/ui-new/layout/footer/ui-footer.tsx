import { Flex } from '@mantine/core';
import type React from 'react';
import classes from './ui-footer.module.css';

export const UIFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <Flex
        className={classes.uiFooter}
        data-mantine-color-scheme="light"
        c='white'
        bg='primary.6'
        h={'1lh'}
    >
        {children}
    </Flex>;
};
