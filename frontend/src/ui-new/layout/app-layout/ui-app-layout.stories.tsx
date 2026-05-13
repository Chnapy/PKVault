import { Paper } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIStorageContent } from '../../storage/storage-content/ui-storage-content';
import { UIAppLayout } from './ui-app-layout';

const meta = {
    title: 'UI/UIAppLayout',
    component: UIAppLayout,
} satisfies Meta<typeof UIAppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        header: <Paper w='100%' h={60} bg='gray' />,
        bottom: <Paper w='100%' h={60} bg='gray' />,
        footer: <Paper w='100%' h={20} bg='gray' />,
        children: <Paper w='100%' h='100%' miw={200} mih={200} bg='gray' />,
    },
};

export const Storage: Story = {
    args: {
        header: <Paper w='100%' h={60} bg='gray' />,
        bottom: <Paper w='100%' h={60} bg='gray' />,
        footer: <Paper w='100%' h={20} bg='gray' />,
        children: <UIStorageContent
            left={<Paper w='100%' h='100%' miw={200} mih={200} bg='gray' />}
            right={<Paper w='100%' h='100%' miw={200} mih={200} bg='gray' />}
        // middle: <Paper w={60} h='100%' mih={200} bg='gray' />,
        />,
    },
};
