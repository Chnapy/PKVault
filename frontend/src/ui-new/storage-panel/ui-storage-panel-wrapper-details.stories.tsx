import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIStorageDetails } from '../storage-details/ui-storage-details';
import { Primary as StorageDetailsStory } from '../storage-details/ui-storage-details.stories';
import { UIStoragePanel } from './ui-storage-panel';
import { UIStoragePanelWrapperDetails } from './ui-storage-panel-wrapper-details';
import { Primary as StoragePanelStory } from './ui-storage-panel.stories';
import { Box } from '@mantine/core';

const meta = {
    title: 'UI/UIStoragePanelWrapperDetails',
    component: UIStoragePanelWrapperDetails,
    parameters: {
        layout: 'padded',
    },
    decorators: [
        Story => <Box pr={310}>
            <Story />
        </Box>,
    ],
} satisfies Meta<typeof UIStoragePanelWrapperDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        details: <UIStorageDetails
            {...StorageDetailsStory.args}
        />,
        children: <UIStoragePanel
            {...StoragePanelStory.args}
        />
    },
};
