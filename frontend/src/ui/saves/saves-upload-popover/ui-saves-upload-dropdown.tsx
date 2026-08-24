import { ActionIcon, Group, Text, TextInput, ThemeIcon } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { TrashIcon, UploadIcon, XIcon } from 'lucide-react';
import React from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { useTranslate } from '../../../translate/i18n';
import { switchUtil } from '../../../util/switch-util';
import { UIFileZoneInput } from '../../form/file-zone-input/ui-file-zone-input';
import { getPathIcon } from '../../form/globs-input/util/get-path-icon';
import { PathUtil } from '../../form/globs-input/util/path-util';
import { UISwitch } from '../../form/switch/ui-switch';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { usePopover } from '../../interaction/focus-controls/components/popover/hooks/use-popover';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { UIFormCard } from '../../popover/popover-card/ui-form-card';

type FileCustomName = {
    file: File;
    customName: string;
};

type FormData = {
    files: FileCustomName[];
    overwrite: boolean;
};

type UISavesUploadDropdownProps = {
    globResults: string[];
    savesUploadsPath: string;
    loading?: boolean;
    onSubmit: (data: FormData) => Promise<void>;
};

export const UISavesUploadDropdown: React.FC<UISavesUploadDropdownProps> = ({ globResults, savesUploadsPath, loading, onSubmit: onSubmitFn }) => {
    const { t } = useTranslate();
    const popover = usePopover();

    const { register, control, getValues, setValue, handleSubmit, reset } = useForm<FormData>({
        defaultValues: {
            files: [],
            overwrite: false,
        },
    });

    const [ files, overwrite ] = useWatch({ control, name: [ 'files', 'overwrite' ] });

    const getFilepath = (customName: string) => PathUtil.combine(savesUploadsPath, customName);

    const maxFiles = Math.max(0, 5 - files.length);
    const disabled = maxFiles <= 0;
    const hasDuplicates = files.some(f1 => files.filter(f2 => f1.customName === f2.customName).length > 1);
    const hasAlreadyExistingRaw = files.some(f => globResults.includes(getFilepath(f.customName)));
    const hasAlreadyExisting = !overwrite && hasAlreadyExistingRaw;

    const onSubmit = handleSubmit(async data => {
        await onSubmitFn(data);
        reset();
        popover?.setOpened(false);
    });

    return <UIFormCard
        onSubmit={e => {
            e.preventDefault();
            e.stopPropagation();
            return onSubmit(e);
        }}
        title={t('saves.upload.popover.title')}
        icon={<UploadIcon />}
        disabled={files.length === 0 || hasDuplicates || hasAlreadyExisting || loading}
        miw={400}
        w='100%'
    >
        <UIFileZoneInput
            onDrop={files => setValue('files', [
                ...getValues('files'),
                ...files.map((file): FileCustomName => ({ file, customName: file.name }))
            ], { shouldDirty: true })}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={1024 ** 2 * 10}    // 10MB by file
            maxFiles={maxFiles}
            disabled={disabled}
        >
            <Group justify="center" style={{ pointerEvents: 'none' }}>
                <Dropzone.Accept>
                    <ThemeIcon variant='transparent' fz='xl' c='blue'>
                        <UploadIcon />
                    </ThemeIcon>
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <ThemeIcon variant='transparent' fz='xl' c='red'>
                        <XIcon />
                    </ThemeIcon>
                </Dropzone.Reject>
                <Dropzone.Idle>
                    <ThemeIcon variant='transparent' fz='xl' c='dimmed'>
                        <UploadIcon />
                    </ThemeIcon>
                </Dropzone.Idle>

                <div>
                    <Text inline>
                        {t('saves.upload.popover.drag.1')}
                    </Text>
                    <Text size="sm" c="dimmed" inline mt='sm'>
                        {t('saves.upload.popover.drag.2', {
                            filesCount: 5,
                            sizeMB: 10,
                        })}
                    </Text>
                </div>
            </Group>
        </UIFileZoneInput>

        {files.map(({ file, customName }, i) => {
            const hasDuplicates = files.filter(item => item.customName === customName).length > 1;
            const hasAlreadyExisting = globResults.includes(getFilepath(customName));

            return <InnerFileItem
                key={i}
                {...register(`files.${i}.customName`)}
                path={getFilepath(customName)}
                onRemove={() => setValue('files', getValues('files').filter(item => item.file !== file))}
                state={hasDuplicates ? 'duplicate' : (
                    hasAlreadyExisting
                        ? (overwrite ? 'existing-overwrite' : 'existing')
                        : undefined
                )}
            />;
        })}

        <UISwitch
            name='upload-overwrite'
            controlLabel={t('action.select')}
            label={t('saves.upload.popover.overwrite')}
            checked={overwrite}
            onChange={() => setValue('overwrite', !getValues('overwrite'), { shouldDirty: true })}
            style={hasAlreadyExistingRaw
                ? undefined
                : {
                    display: 'none',
                }}
        />
    </UIFormCard>
};

const InnerFileItem: React.FC<{
    path: string;
    onRemove: () => void;
    state?: 'duplicate' | 'existing' | 'existing-overwrite';
} & UseFormRegisterReturn> = ({ path, onRemove, state, name, ...inputProps }) => {
    const { t } = useTranslate();

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        controls: [
            getSelectControl({
                main: false,
                label: t('action.select'),
            }),
            {
                name: 'delete',
                label: t('action.delete'),
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'Y' ],
                    },
                },
                spread: false,
                action: () => {
                    onRemove();
                },
            },
        ],
    });

    return <Group {...focusProps} align='flex-start' bdrs='md'>
        <WithControlsIcons placement='out' icons={controlIcons('open')} style={{ flexGrow: 1, lineBreak: 'anywhere' }}>
            <TextInput
                name={name}
                {...controlProps('open')}
                {...inputProps}
                size='md'
                w='100%'
                lh={1}
                styles={{
                    input: {
                        '--input-height': '30px',
                        '--input-size': '30px',
                    },
                }}
                leftSection={getPathIcon('unknown')}
                error={state && switchUtil(state, {
                    duplicate: t('saves.upload.popover.item.duplicate'),
                    existing: t('saves.upload.popover.item.exist'),
                    "existing-overwrite": t('saves.upload.popover.item.exist-overwrite'),
                })}
                errorProps={state === 'existing-overwrite' ? {
                    c: 'yellow'
                } : undefined}
            />
        </WithControlsIcons>

        <WithControlsIcons placement='out' icons={controlIcons('delete')}>
            <ActionIcon
                size="input-xs" variant="subtle" color="gray"
                {...controlProps('delete')}
            >
                <TrashIcon />
            </ActionIcon>
        </WithControlsIcons>
    </Group>;
};
