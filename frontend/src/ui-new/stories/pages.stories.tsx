import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataActionType } from '../../data/sdk/model';
import { UIActionsPanel } from '../actions-panel/ui-actions-panel';
import { UIAppLayout } from '../layout/app-layout/ui-app-layout';
import { UIFooter } from '../layout/footer/ui-footer';
import { UIHeader } from '../layout/header/ui-header';
import { WithBanks as UIHeaderBanksStory, WithSingleBank as UIHeaderSingleBankStory } from '../layout/header/ui-header.stories';
import { UIStorageContent } from '../storage/storage-content/ui-storage-content';
import { UIStoragePanelWrapperDetails } from '../storage/storage-panel/ui-storage-panel-wrapper-details';
import { EmptyData as StoragePanelWrapperEmptyStory, Primary as StoragePanelWrapperStory } from '../storage/storage-panel/ui-storage-panel-wrapper-details.stories';

const meta = {
    title: 'Pages',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const StoragePage: Story = {
    render: () => <UIAppLayout
        header={<UIHeader {...UIHeaderBanksStory.args} />}
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
        footer={<UIFooter />}
        children={<UIStorageContent
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
        />}
    />,
};

export const StoragePageEmpty: Story = {
    render: () => <UIAppLayout
        header={<UIHeader {...UIHeaderSingleBankStory.args} />}
        bottom={<UIActionsPanel
            data={[]}
        />}
        footer={<UIFooter />}
        children={<UIStorageContent
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
        />}
    />,
};
