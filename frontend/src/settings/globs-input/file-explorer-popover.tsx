import React from 'react';
import { useSettingsGet, useSettingsGetDirectoryLs } from '../../data/sdk/settings/settings.gen';
import { UIFileExplorerPopover } from '../../ui/form/globs-input/ui-file-explorer-popover';
import { UIPathButton, type UIPathButtonProps } from '../../ui/form/globs-input/ui-path-button';
import { PathUtil } from '../../ui/form/globs-input/util/path-util';

export type FileExplorerPopoverProps = {
    name: string;
    value: string;
    onChange: (value: string) => void;
} & Omit<UIPathButtonProps, "value" | 'onChange'>;

export const FileExplorerPopover: React.FC<FileExplorerPopoverProps> = ({ name, value, onChange, ...btnProps }) => {
    const [ dropdownOpened, setDropdownOpened ] = React.useState(false);

    const settingsQuery = useSettingsGet();
    const pkvaultPath = settingsQuery.data && PathUtil.asDirectory(settingsQuery.data.data.appDirectory);

    const directoryPath = PathUtil.getValueDirectoryPath(value);
    const directoryLsQuery = useSettingsGetDirectoryLs({ directoryPath }, { query: { enabled: dropdownOpened } });

    const loading = directoryLsQuery.isPending && directoryLsQuery.isEnabled;

    const data = directoryLsQuery.data?.data;

    return <UIFileExplorerPopover
        name={name}
        value={PathUtil.normalizePath(value)}
        onChange={onChange}
        loading={loading}
        dataDirectoryPaths={data?.directoryPaths ?? []}
        dataFilePaths={data?.filePaths ?? []}
        pkvaultPath={pkvaultPath ?? ''}
        reloadData={directoryLsQuery.refetch}
        setDropdownOpened={setDropdownOpened}
    >
        {props => <UIPathButton
            {...props}
            {...btnProps}
            value={value}
            onClick={e => {
                props.onClick?.(e);
                btnProps.onClick?.(e);
            }}
            style={{
                ...props.style,
                ...btnProps.style,
            } as React.CSSProperties}
        />}
    </UIFileExplorerPopover>;
};
