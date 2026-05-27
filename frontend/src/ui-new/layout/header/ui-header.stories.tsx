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
            <UIHeaderItem id='saves' to='/saves'>SAVES</UIHeaderItem>
            <UIHeaderItem id='storage' to='/storage' selected>STORAGE</UIHeaderItem>
            <UIHeaderItem id='pokedex' to='/pokedex'>POKEDEX</UIHeaderItem>
        </>,
        right: <>
            <UIHeaderItem id='help' to='/'>HELP</UIHeaderItem>
            <UIHeaderItem id='settings' to='/settings'>BACKUPS & SETTINGS</UIHeaderItem>
        </>,
    },
};

export const WithSingleBank: Story = {
    args: {
        ...Primary.args,
        sub: <UIBankList
            value='1'
            data={[
                { id: '1', label: 'Bank 1', boxCount: 1, pkmCount: 0 },
            ]}
            onChange={console.log}
            onDelete={console.log}
        />,
    },
};

export const WithStorageBanks: Story = {
    args: {
        ...Primary.args,
        sub: <UIBankList
            value='1'
            data={[
                { id: '1', label: 'Bank 1', boxCount: 1, pkmCount: 0 },
                { id: '2', label: 'Bank 2', boxCount: 1, pkmCount: 2145 },
                { id: '3', label: 'Bank 3', boxCount: 1, pkmCount: 0 },
                { id: '4', label: 'Bank 4', boxCount: 1, pkmCount: 0 },
                { id: '5', label: 'Bank 5', boxCount: 1, pkmCount: 0 },
                { id: '6', label: 'Bank 6', boxCount: 1, pkmCount: 0 },
                { id: '7', label: 'Bank 7', boxCount: 1, pkmCount: 0 },
                { id: '8', label: 'Bank 8', boxCount: 1, pkmCount: 0 },
                { id: '9', label: 'Bank 9', boxCount: 1, pkmCount: 0 },
            ]}
            onChange={console.log}
            onDelete={console.log}
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
