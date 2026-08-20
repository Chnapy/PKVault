import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { UIGlobsInputItem, type UIGlobsInputItemProps } from '../../ui/form/globs-input/ui-globs-input-item';
import { UIPathButton } from '../../ui/form/globs-input/ui-path-button';
import { getDesktopFileTypeInfos, getPathInfos } from '../../ui/form/globs-input/util/get-path-infos';
import { FileExplorerPopover, type FileExplorerPopoverProps } from './file-explorer-popover';
import { useDesktopMessage } from './hooks/use-desktop-message';

export type GlobsInputItemProps = Pick<UIGlobsInputItemProps, 'name' | 'value' | 'onRemove' | 'disabled'>
    & Pick<FileExplorerPopoverProps, 'onChange'>
    & {
        limit: number;
        'data-item-last'?: boolean;
    };

export const GlobsInputItem: React.FC<GlobsInputItemProps> = ({ name, value, onChange, onRemove, limit, disabled, ...rest }) => {
    const desktopMessage = useDesktopMessage();

    const isGlob = value.includes('*');
    const isDirectory = isGlob || value.endsWith('/');
    const isExclude = value.startsWith('!');

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
    const hasError = !isLoading && globResultsQuery.isError;
    const hasWarning = !isLoading && (hasError || data.length === 0);

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
        {props => desktopMessage
            ? <UIPathButton
                {...props}
                value={value}
                onClick={async e => {
                    props.onClick?.(e);

                    const typeInfos = getPathInfos(value);
                    if (typeInfos.type === 'exclude')
                        return;

                    let basePath = value;
                    if (typeInfos.type === 'file') {
                        const pathParts = value.split('/');
                        pathParts.pop();
                        basePath = pathParts.join('/');
                    }

                    const desktopInfos = getDesktopFileTypeInfos(typeInfos.type);

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
            />
            : <FileExplorerPopover
                {...props}
                name={`${name}-file-explore`}
                value={value}
                onChange={onChange}
                {...rest}
            />}
    </UIGlobsInputItem>;
};
