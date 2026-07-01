import { ActionIcon, Group, TextInput } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { SendIcon, XIcon } from 'lucide-react';
import type React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls, type UseFocusControlsParams } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';

export type UITextInputProps = TextInput.Props & Pick<UseFocusControlsParams, 'focusOnMount'> & {
    name: string;
    onSubmit?: () => void;
    onCancel?: () => void;
};

export const UITextInput: React.FC<UITextInputProps> = ({ name, onSubmit, onCancel, focusOnMount, ...rest }) => {

    const { popScope } = Focus.usePushPopScope();

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            getSelectControl({
                label: 'Focus',
            }),
            onSubmit && {
                name: 'submit' as const,
                label: 'Submit',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    }
                },
                spread: false,
                action: () => {
                    onSubmit();
                    popScope();
                },
            },
            onCancel && {
                name: 'cancel' as const,
                label: 'Cancel',
                triggers: {
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'B' ],
                    }
                },
                spread: false,
                action: () => {
                    onCancel();
                    popScope();
                },
            },
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={controlIcons('open')}>
        <TextInput
            // label='Label'
            // description='Description'
            name={name}
            rightSectionWidth='auto'
            rightSection={(onCancel || onSubmit) && <Group gap='xs' wrap='nowrap'>
                {onCancel && <WithControlsIcons placement='out' icons={controlIcons('cancel')}>
                    <ActionIcon size='sm' variant='subtle' {...controlProps('cancel')}>
                        <XIcon />
                    </ActionIcon>
                </WithControlsIcons>}

                {onSubmit && <WithControlsIcons placement='out' icons={controlIcons('submit')}>
                    <ActionIcon size='sm' variant='subtle' color='blue' {...controlProps('submit')}>
                        <SendIcon />
                    </ActionIcon>
                </WithControlsIcons>}
            </Group>}
            {...focusProps}
            {...controlProps('open')}
            {...rest}
            ref={ref}
            styles={{
                ...rest.styles,
                root: {
                    flexGrow: 1,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(rest.styles as any)?.root,
                },
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
        />
    </WithControlsIcons>;
};
