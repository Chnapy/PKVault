import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataActionType } from '../../data/sdk/model';
import { UIActionsPanel } from '../actions-panel/ui-actions-panel';
import { UIAppLayout } from '../frame/app-layout/ui-app-layout';
import { UIHeader } from '../frame/header/ui-header';
import { WithBanks as UIHeaderBanksStory, WithSingleBank as UIHeaderSingleBankStory } from '../frame/header/ui-header.stories';
import { UIStoragePanelWrapperDetails } from '../storage-panel/ui-storage-panel-wrapper-details';
import { EmptyData as StoragePanelWrapperEmptyStory, Primary as StoragePanelWrapperStory } from '../storage-panel/ui-storage-panel-wrapper-details.stories';

const meta = {
    title: 'Pages',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StoragePage: Story = {
    render: () => <UIAppLayout
        header={<UIHeader {...UIHeaderBanksStory.args} />}
        left={<UIStoragePanelWrapperDetails
            {...StoragePanelWrapperStory.args}
        />}
        right={<UIStoragePanelWrapperDetails
            {...StoragePanelWrapperStory.args}
        />}
        // middle={<Stack mah='100%' w='fit-content' style={{ flexGrow: 0 }}>
        //     <Card p='sm' style={{ flexShrink: 0 }}>
        //         <Button size='compact-sm'>
        //             <ThemeIcon variant='transparent' size='xs'> <ArrowLeftRightIcon /></ThemeIcon>
        //         </Button>
        //     </Card>

        //     <UIStorageClipboard
        //         {...StorageClipboardStory.args}
        //     />
        // </Stack>}
        bottom={<UIActionsPanel
            data={[
                {
                    type: DataActionType.DATA_NORMALIZE,
                },
                {
                    type: DataActionType.MOVE_PKM,
                },
                {
                    type: DataActionType.MAIN_CREATE_BOX,
                },
                {
                    type: DataActionType.EVOLVE_PKM,
                },
                {
                    type: DataActionType.MAIN_DELETE_BANK,
                },
            ]}
        />}
    />,
};

export const StoragePageEmpty: Story = {
    render: () => <UIAppLayout
        header={<UIHeader {...UIHeaderSingleBankStory.args} />}
        left={<UIStoragePanelWrapperDetails
            {...StoragePanelWrapperEmptyStory.args}
        />}
        right={<UIStoragePanelWrapperDetails
            {...StoragePanelWrapperEmptyStory.args}
        />}
        // middle={<Stack mah='100%' w='fit-content' style={{ flexGrow: 0 }}>
        //     <Card p='sm' style={{ flexShrink: 0 }}>
        //         <Button size='compact-sm'>
        //             <ThemeIcon variant='transparent' size='xs'> <ArrowLeftRightIcon /></ThemeIcon>
        //         </Button>
        //     </Card>

        //     <UIStorageClipboard
        //         {...StorageClipboardEmptyStory.args}
        //     />
        // </Stack>}
        bottom={<UIActionsPanel
            data={[]}
        />}
    />,
};
