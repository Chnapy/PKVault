import { Group, InputWrapper, type InputWrapperProps } from '@mantine/core';
import type React from 'react';

type UIInputLabelProps = {
    forInput?: string;
    leftSection?: React.ReactNode;
} & InputWrapperProps;

export const UIInputLabel: React.FC<UIInputLabelProps> = ({ forInput, leftSection, ...rest }) => {
    return <Group wrap='nowrap'>
        {leftSection}

        <InputWrapper
            labelProps={{ htmlFor: forInput }}
            style={{ display: 'flex', alignItems: 'center' }}
            {...rest}
        />
    </Group>;
};
