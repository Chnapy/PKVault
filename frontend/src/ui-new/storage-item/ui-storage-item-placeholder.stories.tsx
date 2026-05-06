import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIStorageItemPlaceholder } from './ui-storage-item-placeholder';

const meta = {
    title: 'UI/UIStorageItemPlaceholder',
    component: UIStorageItemPlaceholder,
    tags: [ 'autodocs' ],
} satisfies Meta<typeof UIStorageItemPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {},
};

export const Small: Story = {
    args: {
        small: true,
    },
};
