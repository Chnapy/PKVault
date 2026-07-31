import { Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
    render: () => <Stack w={500} m='auto'>

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
            labelList='Saves files locations'
            labelAddFile='Add a save'
            labelAddFolder='Add a save directory'
            onAdd={async (...params) => console.log(...params)}
            isDesktop//={false}
            results={<UIGlobsInputResults
                name='results'
                data={generatePaths('c:/abc/def/', 100)}
                showFiles
            />}
        >
            <UIGlobsInputItem
                name='1'
                value={'./**/*.sav'}
                onEdit={console.log}
                onRemove={console.log}
                // disabled={disabled}
                results={generatePaths('c:/abc/zoo/', 100)}
                isDesktop//={false}
            />
            <UIGlobsInputItem
                name='2'
                value={'./foo/bar.bin'}
                onEdit={console.log}
                onRemove={console.log}
                // disabled={disabled}
                results={generatePaths('c:/abc/foo/', 100)}
                isDesktop//={false}
            />
            <UIGlobsInputItem
                name='3'
                value={'!./**/*.bin'}
                onEdit={console.log}
                onRemove={console.log}
                // disabled={disabled}
                results={generatePaths('c:/abc/foo/', 100)}
                isDesktop//={false}
            />
        </UIGlobsInputList>

    </Stack>
};
