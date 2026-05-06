import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIStorageItem } from '../storage-item/ui-storage-item';
import { UIStorageItemPlaceholder } from '../storage-item/ui-storage-item-placeholder';
import { Small as StorageItemPlaceholderSmall } from '../storage-item/ui-storage-item-placeholder.stories';
import { Small as StorageItemSmall } from '../storage-item/ui-storage-item.stories';
import { UIStorageClipboard } from './ui-storage-clipboard';

const meta = {
    title: 'UI/UIStorageClipboard',
    component: UIStorageClipboard,
    parameters: {
        layout: 'centered'
    },
} satisfies Meta<typeof UIStorageClipboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        children: new Array(30).fill(0).map((_, i) =>
            i % 3 === 0
                ? <UIStorageItemPlaceholder key={i} {...StorageItemPlaceholderSmall.args} />
                : <UIStorageItem key={i} {...StorageItemSmall.args} />),
    },
};
