import { Card } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UISpriteSizeWrapper } from '../../../sprite-img/ui-sprite-size-wrapper';
import { UIStorageItemPlaceholder } from './ui-storage-item-placeholder';

const meta = {
    title: 'UI/UIStorageItemPlaceholder',
    component: UIStorageItemPlaceholder,
    decorators: Story => <Card display='inline-flex'>
        <Story />
    </Card>,
} satisfies Meta<typeof UIStorageItemPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {},
    decorators: Story => <UISpriteSizeWrapper
        component='div'
        speciesSize='md'
    >
        <Story />
    </UISpriteSizeWrapper>,
};

export const Small: Story = {
    args: {},
    decorators: Story => <UISpriteSizeWrapper
        component='div'
        speciesSize='sm'
    >
        <Story />
    </UISpriteSizeWrapper>,
};

export const Large: Story = {
    args: {},
    decorators: Story => <UISpriteSizeWrapper
        component='div'
        speciesSize='lg'
    >
        <Story />
    </UISpriteSizeWrapper>,
};
