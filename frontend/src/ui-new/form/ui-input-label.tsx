import { Group, InputWrapper, type InputWrapperProps } from '@mantine/core';
import type React from 'react';

type UIInputLabelProps = {
    forInput?: string;
    leftSection?: React.ReactNode;
    align?: React.CSSProperties[ 'alignItems' ];
} & InputWrapperProps;

export const UIInputLabel: React.FC<UIInputLabelProps> = ({ forInput, leftSection, align = 'center', ...rest }) => {
    return <InputWrapper
        labelProps={{ htmlFor: forInput }}
        style={{ display: 'flex', alignItems: align }}
        {...rest}
        label={<Group wrap='nowrap' py={3}>
            {leftSection}
            {rest.label}
        </Group>}
    />;
};
