import { Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIFileExplorerPopover } from './globs-input/ui-file-explorer-popover';
import { UIPathButton } from './globs-input/ui-path-button';
import { UIGlobsInputItem } from './globs-input/ui-globs-input-item';
import { UIGlobsInputList } from './globs-input/ui-globs-input-list';
import { UIGlobsInputResults } from './globs-input/ui-globs-input-results';
import { UISelect } from './select/ui-select';
import { UISwitch } from './switch/ui-switch';
import { UITextInput } from './text-input/ui-text-input';

const meta = {
    title: 'UI/Form',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const generatePaths = (base: string, length: number) => new Array(length).fill(0).map((_, i) => `${base}-${i}.sav`);

export const Primary: Story = {
    render: () => <Stack w={500} py='md' m='auto'>

        <UISelect
            controlLabel='Select'
            name='select'
            data={[ 'english', 'francais', 'foobar' ]}
        />

        <UITextInput
            name='text-input'
        />

        <UISwitch
            controlLabel='Switch'
            name='switch'
        />

        <UIGlobsInputList
            id='saves'
            labelList='Saves files locations'
            labelAddFile='Add a save'
            labelAddFolder='Add a save directory'
            onAdd={async (...params) => console.log(...params)}
            isDesktop//={false}
            results={<UIGlobsInputResults
                name='results'
                data={generatePaths('c:/abc/def', 100)}
                showFiles
            />}
        >
            <UIGlobsInputItem
                name='1'
                value={'./**/*.sav'}
                onRemove={() => console.log('remove')}
                // disabled={disabled}
                results={generatePaths('c:/abc/zoo', 100)}
            >
                {props => <UIFileExplorerPopover
                    name='1-explorer'
                    value={'./**/*.sav'}
                    onChange={console.log}
                    reloadData={console.log}
                    // loading
                    dataDirectoryPaths={[ './foo', './bar' ]}
                    dataFilePaths={[ './toto.txt', './tata.sav' ]}
                    setDropdownOpened={console.log}
                >
                    {otherProps => <UIPathButton
                        {...props}
                        {...otherProps}
                        value={'./**/*.sav'}
                        onClick={e => {
                            props.onClick?.(e);
                            otherProps.onClick?.(e);
                        }}
                    />}
                </UIFileExplorerPopover>}
            </UIGlobsInputItem>

            <UIGlobsInputItem
                name='2'
                value={'./foo/bar.bin'}
                onRemove={() => console.log('remove')}
                // disabled={disabled}
                results={generatePaths('c:/abc/foo', 100)}
            >
                {props => <UIFileExplorerPopover
                    name='2-explorer'
                    value={'./**/*.sav'}
                    onChange={console.log}
                    reloadData={console.log}
                    // loading
                    dataDirectoryPaths={[ './foo', './bar' ]}
                    dataFilePaths={[ './toto.txt', './tata.sav' ]}
                    setDropdownOpened={console.log}
                >
                    {otherProps => <UIPathButton
                        {...props}
                        {...otherProps}
                        value={'./**/*.sav'}
                        onClick={e => {
                            props.onClick?.(e);
                            otherProps.onClick?.(e);
                        }}
                    />}
                </UIFileExplorerPopover>}
            </UIGlobsInputItem>

            <UIGlobsInputItem
                name='3'
                value={'!./**/*.bin'}
                onRemove={() => console.log('remove')}
                // disabled={disabled}
                results={generatePaths('c:/abc/foo', 100)}
            >
                {props => <UIFileExplorerPopover
                    name='3-explorer'
                    value={'./**/*.sav'}
                    onChange={console.log}
                    reloadData={console.log}
                    // loading
                    dataDirectoryPaths={[ './foo', './bar' ]}
                    dataFilePaths={[ './toto.txt', './tata.sav' ]}
                    setDropdownOpened={console.log}
                >
                    {otherProps => <UIPathButton
                        {...props}
                        {...otherProps}
                        value={'./**/*.sav'}
                        onClick={e => {
                            props.onClick?.(e);
                            otherProps.onClick?.(e);
                        }}
                    />}
                </UIFileExplorerPopover>}
            </UIGlobsInputItem>
        </UIGlobsInputList>

    </Stack>
};
