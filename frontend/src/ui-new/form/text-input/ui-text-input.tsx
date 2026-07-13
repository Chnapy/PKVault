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
    onSubmit?: () => unknown;
    onCancel?: () => unknown;
    submitDisabled?: boolean;
    submitLoading?: boolean;
    cancelDisabled?: boolean;
};

export const UITextInput: React.FC<UITextInputProps> = ({ name, onSubmit, onCancel, submitDisabled, submitLoading, cancelDisabled, focusOnMount, ...rest }) => {

    const { popScope } = Focus.usePushPopScope();

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        focusOnMount,
        controls: [
            getSelectControl({
                label: 'Focus',
            }),
            onSubmit && !submitDisabled && {
                name: 'submit' as const,
                label: 'Submit',
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    }
                },
                spread: false,
                action: () => {
                    const result = onSubmit();
                    if (result instanceof Promise)
                        return result.then(popScope);
                    popScope();
                },
            },
            onCancel && !cancelDisabled && {
                name: 'cancel' as const,
                label: 'Cancel',
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'B' ],
                    }
                },
                spread: false,
                action: () => {
                    const result = onCancel();
                    if (result instanceof Promise)
                        return result.then(popScope);
                    popScope();
                },
            },
        ],
    });

    const ref = useMergedRef(
        focusProps.ref,
        rest.ref,
    );

    return <WithControlsIcons placement='out' icons={controlIcons('open', 'cancel', 'submit')}>
        <TextInput
            // label='Label'
            // description='Description'
            name={name}
            rightSectionWidth='auto'
            rightSection={(onCancel || onSubmit) && <Group gap='xs' wrap='nowrap'>
                {onCancel && <ActionIcon size='sm' variant='subtle' {...controlProps('cancel')}>
                    <XIcon />
                </ActionIcon>}

                {onSubmit && <ActionIcon size='sm' variant='subtle' color='blue' loading={submitLoading} {...controlProps('submit')}>
                    <SendIcon />
                </ActionIcon>}
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
