import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIBankList } from '../../bank/ui-bank-list';
import { UISettingsCategories } from '../../settings/categories/ui-settings-categories';
import { UIFrame } from '../frame/ui-frame';
import { UIHeader } from './ui-header';
import { UIHeaderItem } from './ui-header-item';

const meta = {
    title: 'UI/UIHeader',
    component: UIHeader,
    decorators: [
        Story => <UIFrame>
            <Story />
        </UIFrame>,
    ],
} satisfies Meta<typeof UIHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        left: <>
            <UIHeaderItem id='saves' to='/saves' label='Saves'>SAVES</UIHeaderItem>
            <UIHeaderItem id='storage' to='/storage' label='Storage' selected>STORAGE</UIHeaderItem>
            <UIHeaderItem id='pokedex' to='/pokedex' label='Pokedex'>POKEDEX</UIHeaderItem>
        </>,
        right: <>
            <UIHeaderItem id='help' to='/' label='Help'>HELP</UIHeaderItem>
            <UIHeaderItem id='settings' to='/settings' label='Backups & settings'>BACKUPS & SETTINGS</UIHeaderItem>
        </>,
    },
};

export const WithSingleBank: Story = {
    args: {
        ...Primary.args,
        sub: <UIBankList
            value='1'
            data={[
                { id: '1', label: 'Bank 1', container: '' },
            ]}
            onCreate={console.log}
            onChange={console.log}
        />,
    },
};

export const WithStorageBanks: Story = {
    args: {
        ...Primary.args,
        sub: <UIBankList
            value='1'
            data={[
                { id: '1', label: 'Bank 1', container: '' },
                { id: '2', label: 'Bank 2', container: '' },
                { id: '3', label: 'Bank 3', container: '' },
                { id: '4', label: 'Bank 4', container: '' },
                { id: '5', label: 'Bank 5', container: '' },
                { id: '6', label: 'Bank 6', container: '' },
                { id: '7', label: 'Bank 7', container: '' },
                { id: '8', label: 'Bank 8', container: '' },
                { id: '9', label: 'Bank 9', container: '' },
            ]}
            onCreate={console.log}
            onChange={console.log}
        />,
    },
};

export const WithSettingsCategories: Story = {
    args: {
        ...Primary.args,
        sub: <UISettingsCategories
            value='main'
            onChange={console.log}
            data={[
                {
                    id: 'main',
                    label: 'Main',
                },
                {
                    id: 'external-pkms',
                    label: 'External pkms',
                },
                {
                    id: 'backups',
                    label: 'Backups',
                },
            ]}
        />,
    },
};
