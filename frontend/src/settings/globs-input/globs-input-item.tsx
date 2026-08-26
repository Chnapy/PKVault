import React from 'react';
import { useSettingsGet, useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { UIGlobsInputItem, type UIGlobsInputItemProps } from '../../ui/form/globs-input/ui-globs-input-item';
import { UIPathButton } from '../../ui/form/globs-input/ui-path-button';
import { getDesktopFileTypeInfos } from '../../ui/form/globs-input/util/get-desktop-file-type-infos';
import { PathUtil } from '../../ui/form/globs-input/util/path-util';
import { FileExplorerPopover, type FileExplorerPopoverProps } from './file-explorer-popover';
import { useDesktopMessage } from './hooks/use-desktop-message';

export type GlobsInputItemProps = Pick<UIGlobsInputItemProps, 'name' | 'value' | 'onRemove' | 'disabled'>
    & Partial<Pick<FileExplorerPopoverProps, 'onChange'>>
    & {
        limit: number;
        'data-item-last'?: boolean;
    };

export const GlobsInputItem: React.FC<GlobsInputItemProps> = ({ name, value, onChange, onRemove, limit, disabled, ...rest }) => {
    const desktopMessage = useDesktopMessage();

    const isGlob = PathUtil.isGlob(value);
    const isDirectory = isGlob || PathUtil.isDirectory(value);
    const isExclude = PathUtil.isExclude(value);

    const settingsQuery = useSettingsGet();
    const settings = settingsQuery.data?.data;

    const pkvaultPath = settings && PathUtil.asDirectory(settings.appDirectory);
    const uploadPath = settings && PathUtil.asDirectory(settings.savesUploadsPath);

    const globResultsQuery = useSettingsGetSaveGlobsResults({
        globs: [ value ],
        limit,
    }, {
        query: {
            enabled: !isExclude,
        },
    });

    const data = globResultsQuery.data?.data ?? [];

    const isLoading = globResultsQuery.isPending && globResultsQuery.isEnabled;
    const hasError = !!onChange && !isLoading && globResultsQuery.isError;
    const hasWarning = !!onChange && !isLoading && (hasError || data.length === 0);

    return <UIGlobsInputItem
        name={name}
        value={value}
        onRemove={onRemove}
        disabled={disabled}
        results={data}
        hasError={hasError}
        hasWarning={hasWarning}
        isLoading={isLoading}
        openFolder={desktopMessage && (() => desktopMessage.openFile({
            type: 'open-folder',
            isDirectory,
            path: value,
        }))}
    >
        {props => {
            if (!onChange)
                return <UIPathButton
                    {...props}
                    value={value}
                    disabled
                    pkvaultPath={pkvaultPath ?? ''}
                    uploadPath={uploadPath ?? ''}
                />;

            if (desktopMessage)
                return <UIPathButton
                    {...props}
                    value={value}
                    onClick={async e => {
                        props.onClick?.(e);

                        if (isExclude)
                            return;

                        const basePath = isDirectory ? value : PathUtil.getValueDirectoryPath(value);

                        const desktopInfos = getDesktopFileTypeInfos(isExclude ? 'exclude' : isDirectory ? 'folder' : 'file');

                        const response = await desktopMessage.fileExplore({
                            type: 'file-explore',
                            id: desktopInfos.id,
                            directoryOnly: desktopInfos.directoryOnly,
                            basePath,
                            multiselect: false,
                        });

                        const newValue = desktopInfos.getFinalPaths(response.values)[ 0 ];
                        if (!newValue)
                            return;

                        onChange(newValue);
                    }}
                    disabled={isExclude || disabled}
                    pkvaultPath={pkvaultPath ?? ''}
                    uploadPath={uploadPath ?? ''}
                />;

            return <FileExplorerPopover
                {...props}
                name={`${name}-file-explore`}
                value={value}
                onChange={onChange}
                pkvaultPath={pkvaultPath ?? ''}
                uploadPath={uploadPath ?? ''}
                {...rest}
            />;
        }}
    </UIGlobsInputItem>;
};
