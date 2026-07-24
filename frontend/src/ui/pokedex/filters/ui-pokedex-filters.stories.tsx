import { Checkbox, Group, InputWrapper, Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleOff, EyeIcon, EyeOffIcon, FolderIcon, FolderXIcon } from 'lucide-react';
import { UIButton } from '../../form/button/ui-button';
import { UIAutocomplete } from '../../form/select/ui-autocomplete';
import { UIMultiSelect } from '../../form/select/ui-multi-select';
import { UISegmentedControl } from '../../form/select/ui-segmented-control';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UIPokedexFilters } from './ui-pokedex-filters';

const meta = {
    title: 'UI/UIPokedexFilters',
    component: UIPokedexFilters,
} satisfies Meta<typeof UIPokedexFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        views: <Checkbox.Group
            value={[ '1' ]}
            onChange={console.log}
            label="Views"
        >
            <Group grow wrap='nowrap'>
                <Checkbox.Card
                    renderRoot={props => <UIButton
                        name='display-forms'
                        controlLabel='Display forms'
                        leftSection={<Checkbox.Indicator />}
                        styles={{
                            label: {
                                flexGrow: 1,
                            },
                        }}
                        {...props}
                    />}
                    value='1'
                >
                    Forms
                </Checkbox.Card>

                <Checkbox.Card
                    renderRoot={props => <UIButton
                        name='display-genders'
                        controlLabel='Display genders'
                        leftSection={<Checkbox.Indicator />}
                        styles={{
                            label: {
                                flexGrow: 1,
                            },
                        }}
                        {...props}
                    />}
                    value='2'
                >
                    Genders
                </Checkbox.Card>
            </Group>
        </Checkbox.Group>,
        children: <>
            <UIAutocomplete
                name='filter-species'
                label='Species'
                // size='xs'
                data={[ 'foo', 'bar' ]}
                limit={5}
                selectFirstOptionOnChange
                comboboxProps={{
                    position: 'right-start'
                }}
                w='100%'
            />

            <InputWrapper label='Status'>
                <Stack>
                    <UISegmentedControl
                        name='seen'
                        controlLabel='Filter by seen'
                        value='all'
                        data={[
                            { value: 'all', label: 'All' },
                            { value: 'seen', label: <EyeIcon fontSize='1rem' /> },
                            { value: 'not-seen', label: <EyeOffIcon fontSize='1rem' opacity={0.75} /> },
                        ]}
                        onChange={console.log}
                        style={{ flexGrow: 1 }}
                    />
                    <UISegmentedControl
                        name='caught'
                        controlLabel='caught'
                        value='all'
                        data={[
                            { value: 'all', label: 'All' },
                            { value: 'caught', label: <UIBallIcon fontSize='1rem' /> },
                            { value: 'not-caught', label: <CircleOff fontSize='1rem' opacity={0.75}><UIBallIcon /></CircleOff> },
                        ]}
                        onChange={console.log}
                        style={{ flexGrow: 1 }}
                    />
                    <UISegmentedControl
                        name='owned'
                        controlLabel='Filter by owned'
                        value='all'
                        data={[
                            { value: 'all', label: 'All' },
                            { value: 'owned', label: <FolderIcon fontSize='1rem' /> },
                            { value: 'not-owned', label: <FolderXIcon fontSize='1rem' opacity={0.75} /> },
                        ]}
                        onChange={console.log}
                        style={{ flexGrow: 1 }}
                    />
                    <UISegmentedControl
                        name='shiny'
                        controlLabel='Filter by shiny'
                        value='all'
                        data={[
                            { value: 'all', label: 'All' },
                            { value: 'shiny', label: <UIShinyIcon /> },
                            { value: 'not-shiny', label: <UIShinyIcon style={{ opacity: 0.5, filter: 'brightness(0)' }} /> },
                        ]}
                        onChange={console.log}
                        style={{ flexGrow: 1 }}
                    />
                </Stack>
            </InputWrapper>

            <Stack gap='sm'>
                <UIMultiSelect
                    name='filter-type'
                    controlLabel='Filter by type'
                    label='Types'
                    placeholder='Filter by type'
                    data={[
                        'Water',
                        'Fire',
                    ]}
                    onChange={console.log}
                    pillsNoWrap
                    renderPill={({ value = '' }) => value[ 0 ]}
                    style={{ flexGrow: 1 }}
                />

                <UIMultiSelect
                    name='filter-game'
                    controlLabel='Filter by game'
                    label='Storages'
                    placeholder='Filter by game'
                    data={[
                        'PKVault',
                        'Pokemon Blue',
                    ]}
                    onChange={console.log}
                    pillsNoWrap
                    renderPill={({ value = '' }) => value[ 0 ]}
                // size='xs'
                // w={140}
                />
                <UIMultiSelect
                    name='filter-generation'
                    controlLabel='Filter by generation'
                    label='Generations'
                    placeholder='Filter by generation'
                    data={[
                        'Generation 1',
                        'Generation 2',
                    ]}
                    onChange={console.log}
                    pillsNoWrap
                    renderPill={({ value = '' }) => value[ 0 ]}
                // size='xs'
                // w={140}
                />
            </Stack>
        </>,
    },
};
