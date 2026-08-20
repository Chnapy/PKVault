import { ActionIcon, Group } from '@mantine/core';
import { FolderIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls } from '../../interaction/focus-controls/use-focus-controls';
import { UIGlobsFileList } from './ui-globs-file-list';
import type { UIPathButtonProps } from './ui-path-button';
import { PathUtil } from './util/path-util';

export type UIGlobsInputItemProps = {
    name: string;
    value: string;
    onRemove: () => void;
    disabled?: boolean;
    results: string[];
    isLoading?: boolean;
    hasWarning?: boolean;
    hasError?: boolean;
    openFolder?: (path: string, isDirectory: boolean) => void;
    children: (props: Omit<UIPathButtonProps, 'value'>) => React.ReactNode;
};

export const UIGlobsInputItem: React.FC<UIGlobsInputItemProps> = ({
    name, value, onRemove, results, disabled, isLoading, hasWarning, hasError, openFolder, children,
}) => {
    const { t } = useTranslate();

    const isGlob = PathUtil.isGlob(value);
    const isDirectory = isGlob || PathUtil.isDirectory(value);
    const isExclude = PathUtil.isExclude(value);

    const { focusProps, controlProps, controlIcons } = useFocusControls({
        scopeNodeId: name,
        controls: [
            !disabled && getSelectControl({
                main: false,
                label: t('action.select'),
            }),
            !disabled && !isLoading && !hasError && !hasWarning && !isExclude && {
                name: 'list-files' as const,
                label: '',
                triggers: {
                    mouse: {
                        type: 'mouse',
                        values: [ 'left-click' ],
                    },
                    gamepad: {
                        type: 'gamepad',
                        values: [ 'X' ],
                    },
                },
                spread: false,
            },
            !disabled && {
                name: 'delete' as const,
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

    return <Group {...focusProps} align='center' wrap='nowrap' bdrs='md'>

        {children({
            icons: controlIcons('open'),
            ...controlProps('open'),
            style: { flexGrow: 1, lineBreak: 'anywhere' },
        })}

        {!isExclude && <UIGlobsFileList
            results={results}
            isLoading={isLoading}
            hasWarning={hasWarning}
            hasError={hasError}
            icons={controlIcons('list-files')}
            {...controlProps('list-files')}
        />}

        {openFolder && !isExclude && !isGlob && <ActionIcon
            size="lg" variant="subtle" color="gray"
            onClick={() => openFolder(value, isDirectory)}
        >
            <FolderIcon />
        </ActionIcon>}

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
