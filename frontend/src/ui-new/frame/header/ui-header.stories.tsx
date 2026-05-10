import type { Meta, StoryObj } from '@storybook/react-vite';
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
            data={[
                { value: '1', label: 'Bank 1', selected: true },
            ]}
        />,
    },
};

export const WithBanks: Story = {
    args: {
        ...Primary.args,
        sub: <UIBankList
            data={[
                { value: '1', label: 'Bank 1', selected: true },
                { value: '2', label: 'Bank 2' },
                { value: '3', label: 'Bank 3' },
                { value: '4', label: 'Bank 4' },
                { value: '5', label: 'Bank 5' },
                { value: '6', label: 'Bank 6' },
                { value: '7', label: 'Bank 7' },
                { value: '8', label: 'Bank 8' },
                { value: '9', label: 'Bank 9' },
            ]}
        />,
    },
};
