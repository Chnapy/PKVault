import { Button, Combobox, Group, Loader, useCombobox, type ElementProps } from '@mantine/core';
import { AlertTriangleIcon, ChevronDownIcon, FileIcon, SearchIcon } from 'lucide-react';
import React from 'react';
import { WithControlsIcons } from '../../interaction/controls/icons/with-controls-icons';
import { UIPathLine } from '../../path/ui-path-line';
import { getPathIcon } from './util/get-path-icon';
import { PathUtil } from './util/path-util';

type UIGlobsFileListProps = {
    results: string[];
    disabled?: boolean;
    isLoading?: boolean;
    hasWarning?: boolean;
    hasError?: boolean;
    icons?: React.ReactNode;
} & Omit<ElementProps<'button'>, 'results'>;

export const UIGlobsFileList: React.FC<UIGlobsFileListProps> = ({
    results, isLoading, hasWarning, hasError, icons, ...btnProps
}) => {
    const [ search, setSearch ] = React.useState('');

    const combobox = useCombobox();

    return <Combobox
        store={combobox}
        floatingHeight="viewport"
        position='bottom-end'
    >
        <Combobox.Target>
            <WithControlsIcons placement='out' icons={icons}>
                <Button
                    onClick={() => combobox.toggleDropdown()}
                    size='compact-md'
                    fw='normal'
                    color={hasError ? 'red' : undefined}
                    loading={isLoading}
                    leftSection={<FileIcon />}
                    rightSection={hasWarning ? <AlertTriangleIcon /> : <ChevronDownIcon />}
                    miw={80}
                    styles={{
                        label: {
                            flexGrow: 1,
                        },
                    }}
                    {...btnProps}
                >
                    {hasError
                        ? '-'
                        : results.length}
                </Button>
            </WithControlsIcons>
        </Combobox.Target>

        <Combobox.Dropdown miw={400}>
            <Combobox.Search
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Search"
                leftSection={<SearchIcon />}
            />

            <Combobox.Options mah="var(--combobox-floating-options-max-height)" style={{ overflowY: 'scroll' }}>
                {isLoading
                    ? <Combobox.Empty>
                        <Loader type='dots' />
                    </Combobox.Empty>
                    : results
                        .filter(path => path.toLowerCase().includes(PathUtil.normalizePath(search.toLowerCase())))
                        .map(path => {
                            const icon = getPathIcon(path);

                            return <Combobox.Option key={path} value={path} style={{ cursor: 'default' }}>
                                <Group
                                    key={path}
                                    align='center'
                                    wrap='nowrap'
                                >
                                    {icon}
                                    <UIPathLine>{path}</UIPathLine>
                                </Group>
                            </Combobox.Option>;
                        })}
            </Combobox.Options>
        </Combobox.Dropdown>
    </Combobox>;
};
