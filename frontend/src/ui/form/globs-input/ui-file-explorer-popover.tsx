import { Button, Combobox, type ComboboxItem, Group, Text, useCombobox } from '@mantine/core';
import { FolderRootIcon, FolderUpIcon, Loader, MoveLeftIcon, PackageOpenIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';
import React from 'react';
import { useTranslate } from '../../../translate/i18n';
import { UIActionIcon } from '../button/ui-action-icon';
import { UIButton } from '../button/ui-button';
import { getPathIcon } from './util/get-path-icon';
import { PathUtil } from './util/path-util';

export type UIFileExplorerPopoverProps = {
    name: string;
    value: string;
    onChange: (value: string) => void;
    loading?: boolean;
    dataDirectoryPaths: string[];
    dataFilePaths: string[];
    pkvaultPath: string;
    reloadData: () => unknown;
    setDropdownOpened: (opened: boolean) => void;
    children: (props: React.ComponentProps<typeof Button<'button'>>) => React.ReactNode;
};

export const UIFileExplorerPopover: React.FC<UIFileExplorerPopoverProps> = ({
    name, value, onChange, loading, dataDirectoryPaths, dataFilePaths, pkvaultPath, reloadData, setDropdownOpened, children
}) => {
    const { t } = useTranslate();

    const [ search, setSearch ] = React.useState('');
    const searchNormalized = PathUtil.normalizePath(search);
    const searchLower = searchNormalized.toLowerCase();
    const isSearchPath = searchNormalized.includes('/');

    const directoryName = PathUtil.asDirectory(PathUtil.getDirectoryName(value));
    const directoryPath = PathUtil.getValueDirectoryPath(value);

    const getData = (): ComboboxItem[] => {
        const directories = dataDirectoryPaths.map((path): ComboboxItem => ({
            value: PathUtil.asDirectory(path),
            label: PathUtil.asDirectory(path.split('/').pop()!),
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
                        disabled={value === '/'}
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

                    <Option
                        value={directoryPath}
                        label={directoryName}
                        active={directoryPath === value}
                        pkvaultPath={pkvaultPath}
                        py={0.5}
                        style={{ flexGrow: 1 }}
                    />

                    <UIButton
                        name={`${name}-pkvault`}
                        controlLabel={t('action.select')}
                        onClick={() => {
                            onChange('./');
                            setSearch('');
                        }}
                        disabled={value === './'}
                        size='compact-sm'
                        leftSection={<img src='/logo.svg' height={16} />}
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
                        disabled={value === '/'}
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
                                <Option
                                    key={v}
                                    value={v}
                                    label={label}
                                    active={v === value}
                                    pkvaultPath={pkvaultPath}
                                />
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

type OptionProps = Combobox.Option.Props & {
    label: string;
    active?: boolean;
    pkvaultPath: string;
};

const Option: React.FC<OptionProps> = ({ active = false, value, label, pkvaultPath, ...rest }) => {
    return <Combobox.Option
        {...rest}
        value={value}
        {...active
            ? {
                bg: 'primary',
                c: 'white',
                style: { cursor: 'default', ...rest.style },
            }
            : undefined
        }
    >
        <Group>
            {getPathIcon(value as string, active, pkvaultPath)}

            {label}
        </Group>
    </Combobox.Option>;
};
