import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { UIBankList } from '../../bank/ui-bank-list';
import { UIFrame } from '../ui-frame';
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
            <UIHeaderItem to='/saves'>SAVES</UIHeaderItem>
            <UIHeaderItem to='/storage' selected>STORAGE</UIHeaderItem>
            <UIHeaderItem to='/pokedex'>POKEDEX</UIHeaderItem>
        </>,
        right: <>
            <UIHeaderItem to='/'>HELP</UIHeaderItem>
            <UIHeaderItem to='/settings'>BACKUPS & SETTINGS</UIHeaderItem>
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
            onSelect={fn()}
            onDelete={fn()}
        />,
    },
};

export const WithBanks: Story = {
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
            onSelect={fn()}
            onDelete={fn()}
        />,
    },
};
