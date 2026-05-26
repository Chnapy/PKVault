import { ActionIcon, Group, TextInput } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { SendIcon, XIcon } from 'lucide-react';
import type React from 'react';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';

export type UITextInputProps = TextInput.Props & {
    name: string;
    onSubmit?: () => void;
    onCancel?: () => void;
};

export const UITextInput: React.FC<UITextInputProps> = ({ name, onSubmit, onCancel, ...rest }) => {

    const { popScope } = Focus.usePushPopScope();

    const { focusControlProps } = useFocusControls<HTMLInputElement>({
        scopeNodeId: name,
        // focusOnMount: true,
        controls: [
            {
                name: name + '-focus',
                label: 'Focus',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'A' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    focusControlProps.ref.current.focus();
                },
            },
            onSubmit && {
                name: name + '-submit',
                label: 'Submit',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    onSubmit();
                    popScope();
                },
            },
            onCancel && {
                name: name + '-cancel',
                label: 'Cancel',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'B' ],
                    }
                },
                spread: false,
                action: (e, trigger, value) => {
                    onCancel();
                    popScope();
                },
            },
        ],
    });

    const ref = useMergedRef(
        focusControlProps.ref,
        rest.ref,
    );

    return <TextInput
        // label='Label'
        // description='Description'
        rightSectionWidth='auto'
        rightSection={(onCancel || onSubmit) && <Group gap='xs' wrap='nowrap'>
            {onCancel && <ActionIcon size='sm' variant='subtle' onClick={onCancel}>
                <XIcon />
            </ActionIcon>}

            {onSubmit && <ActionIcon size='sm' variant='subtle' color='blue' onClick={onSubmit}>
                <SendIcon />
            </ActionIcon>}
        </Group>}
        {...focusControlProps}
        {...rest}
        ref={ref}
        styles={{
            ...rest.styles,
            input: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ...(rest.styles as any)?.input,
                paddingRight: (onCancel || onSubmit) && `${onCancel && onSubmit ? 2 : 1}lh`,
            },
        }}
    // styles={{
    //     input: isGamepad ? {
    //         textAlign: 'center',
    //     } : undefined,
    // }}
    />;
};
