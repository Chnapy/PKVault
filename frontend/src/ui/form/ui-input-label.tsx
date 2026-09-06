import { Group, InputWrapper, Stack, Text, type InputWrapperProps } from '@mantine/core';
import type React from 'react';

type UIInputLabelProps = {
    forInput?: string;
    leftSection?: React.ReactNode;
    align?: React.CSSProperties[ 'alignItems' ];
} & InputWrapperProps;

export const UIInputLabel: React.FC<UIInputLabelProps> = ({ forInput, leftSection, align = 'center', label, description, ...rest }) => {
    return <InputWrapper
        labelProps={{ htmlFor: forInput }}
        style={{ display: 'flex', alignItems: align }}
        {...rest}
        label={<Group wrap='nowrap' py={3}>
            {leftSection}
            <Stack gap={0}>
                {label}

                {description && <Text c='dimmed' fz='sm' lh={1}>
                    {description}
                </Text>}
            </Stack>
        </Group>}
    />;
};
