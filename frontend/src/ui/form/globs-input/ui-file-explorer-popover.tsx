import { Button, Combobox, type ComboboxItem, Group, Text, useCombobox } from '@mantine/core';
import { FileIcon, FolderIcon, FolderRootIcon, FolderUpIcon, Loader, MoveLeftIcon, PackageOpenIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIActionIcon } from '../button/ui-action-icon';
import { UIButton } from '../button/ui-button';
import { PathUtil } from './util/path-util';

export type UIFileExplorerPopoverProps = {
    name: string;
    value: string;
    onChange: (value: string) => void;
    loading?: boolean;
    dataDirectoryPaths: string[];
    dataFilePaths: string[];
    reloadData: () => unknown;
    setDropdownOpened: (opened: boolean) => void;
    children: (props: React.ComponentProps<typeof Button<'button'>>) => React.ReactNode;
};

export const UIFileExplorerPopover: React.FC<UIFileExplorerPopoverProps> = ({
    name, value, onChange, loading, dataDirectoryPaths, dataFilePaths, reloadData, setDropdownOpened, children
}) => {
    const { t } = useTranslate();

    const [ search, setSearch ] = React.useState('');
    const searchNormalized = PathUtil.normalizePath(search);
    const searchLower = searchNormalized.toLowerCase();
    const isSearchPath = searchNormalized.includes('/');

    const getData = (): ComboboxItem[] => {
        const directories = dataDirectoryPaths.map((path): ComboboxItem => ({
            value: PathUtil.withSeparatorEnd(path),
            label: PathUtil.withSeparatorEnd(path.split('/').pop()!),
            disabled: false,
        }));

        const files = dataFilePaths.map((path): ComboboxItem => ({
            value: path,
            label: path.split('/').pop()!,
            disabled: false,
        }));

        return [
            ...directories,
            ...files,
        ];
    };

    const combobox = useCombobox({
        onDropdownOpen: () => {
            setDropdownOpened(true);
        },
        onDropdownClose: () => {
            setDropdownOpened(false);
            combobox.resetSelectedOption();
        },
    });

    const data = getData()
        .filter(d => !search || d.label.toLowerCase().includes(searchLower));

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={(val) => {
                onChange(val);
            }}
            floatingHeight="viewport"
            offset={0}
        >
            <Combobox.Target>
                {children({
                    onClick: () => combobox.toggleDropdown(),
                    rightSection: <Combobox.Chevron ml='auto' />,
                    style: combobox.dropdownOpened ? {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                    } : undefined,
                })}
            </Combobox.Target>

            <Combobox.Dropdown style={{
                borderTop: 'none',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
            }}>
                <Combobox.Search
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    placeholder={t('action.search')}
                    leftSection={<SearchIcon />}
                    styles={{
                        input: {
                            borderRadius: 0,
                            maxWidth: 'initial',
                        },
                    }}
                />

                <Group px='md' py='sm'>
                    <UIButton
                        name={`${name}-parent`}
                        controlLabel={t('action.select')}
                        onClick={() => {
                            const nextValue = PathUtil.getParentDirectory(value);

                            onChange(nextValue);
                            setSearch('');
                            console.log('CHANGE', nextValue)
                        }}
                        size='compact-sm'
                        leftSection={<FolderUpIcon />}
                    >
                        <MoveLeftIcon />
                    </UIButton>

                    <UIActionIcon
                        name={`${name}-reload`}
                        controlLabel={t('action.select')}
                        onClick={reloadData}
                        variant='default'
                        size={26}
                    >
                        <RefreshCwIcon />
                    </UIActionIcon>

                    <UIButton
                        name={`${name}-pkvault`}
                        controlLabel={t('action.select')}
                        onClick={() => {
                            onChange('./');
                            setSearch('');
                        }}
                        size='compact-sm'
                        leftSection={<UIBallIcon />}
                        ml='auto'
                    >
                        PKVault
                    </UIButton>

                    <UIButton
                        name={`${name}-root`}
                        controlLabel={t('action.select')}
                        onClick={() => {
                            onChange('/');
                            setSearch('');
                        }}
                        size='compact-sm'
                        leftSection={<FolderRootIcon />}
                    >
                        /
                    </UIButton>
                </Group>

                <Combobox.Options mah="var(--combobox-floating-options-max-height)" style={{ overflowY: 'scroll' }}>
                    {loading
                        ? <Combobox.Empty>
                            <Loader type='dots' />
                        </Combobox.Empty>
                        : <>
                            {data.map(({ value: v, label }) => (
                                <Combobox.Option
                                    key={v}
                                    value={v}
                                    {...v === value
                                        ? {
                                            bg: 'primary',
                                            c: 'white',
                                            style: { cursor: 'default' },
                                        }
                                        : {}
                                    }
                                >
                                    <Group fz='md'>
                                        {v.endsWith('/')
                                            ? <FolderIcon color='var(--mantine-color-yellow-9)' />
                                            : <FileIcon />}

                                        {label}
                                    </Group>
                                </Combobox.Option>
                            ))}

                            {data.length === 0 && <>
                                {isSearchPath && value !== searchNormalized
                                    ? <Combobox.Option value={searchNormalized}>
                                        {t('action.select')} {searchNormalized}
                                    </Combobox.Option>
                                    : <Combobox.Empty>
                                        <Text fz='lg' c='dimmed'>
                                            <PackageOpenIcon />
                                        </Text>
                                    </Combobox.Empty>}
                            </>}
                        </>}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
