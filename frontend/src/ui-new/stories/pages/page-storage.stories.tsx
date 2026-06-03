import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataActionType } from '../../../data/sdk/model';
import { UIActionsPanel } from '../../actions-panel/ui-actions-panel';
import { FocusControlsProvider } from '../../interaction/focus-controls/provider/focus-controls-provider';
import type { MoveTargetInput } from '../../interaction/move/context/move-context';
import { MoveProvider } from '../../interaction/move/context/move-provider';
import type { MoveSource } from '../../interaction/move/state/move-state';
import type { SelectContext } from '../../interaction/select/context/select-context';
import { SelectProvider } from '../../interaction/select/context/select-provider';
import { UIAppLayout } from '../../layout/app-layout/ui-app-layout';
import { UIFooter } from '../../layout/footer/ui-footer';
import { UIHeader } from '../../layout/header/ui-header';
import { WithStorageBanks as UIHeaderBanksStory, WithSingleBank as UIHeaderSingleBankStory } from '../../layout/header/ui-header.stories';
import { UIStorageContent } from '../../storage/storage-content/ui-storage-content';
import { UIStoragePanel } from '../../storage/storage-panel/ui-storage-panel';
import { UIStoragePanelWrapperDetails } from '../../storage/storage-panel/ui-storage-panel-wrapper-details';
import { EmptyData as StoragePanelWrapperEmptyStory, Primary as StoragePanelWrapperStory } from '../../storage/storage-panel/ui-storage-panel-wrapper-details.stories';
import { getPanelChildren, EmptyData as StoragePanelEmptyStory, Primary as StoragePanelStory } from '../../storage/storage-panel/ui-storage-panel.stories';

type ContainerValue = { box: number; };

const meta = {
    title: 'Pages/Storage',
    decorators: [
        Story => {

            const containerFns: Pick<SelectContext<ContainerValue>, 'getContainerHash' | 'getContainerValue'> = {
                getContainerHash: value => value.box ? String(value.box) : '',
                getContainerValue: hash => ({ box: Number(hash) }),
            };

            const onDrop = async (source: MoveSource, target: MoveTargetInput<ContainerValue>) => console.log('drop', source, target);

            return <FocusControlsProvider>
                <SelectProvider<ContainerValue>
                    {...containerFns}
                >
                    <MoveProvider<ContainerValue, unknown>
                        {...containerFns}
                        moveContainerId='move-container'
                        useFilterStartDragIds={(container, sourceIds) => () => new Set(sourceIds)}
                        getTargetAllPositions={() => ({})}
                        onDrop={onDrop}
                    >
                        <Story />
                    </MoveProvider>
                </SelectProvider>
            </FocusControlsProvider>;
        },
    ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
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
            onSave={console.log}
        />}
        footer={<UIFooter />}
        children={<UIStorageContent
            id='move-container'
            left={<UIStoragePanelWrapperDetails
                {...StoragePanelWrapperStory.args}
                children={<UIStoragePanel
                    {...StoragePanelStory.args}
                    children={getPanelChildren(1)}
                />}
            />}
            right={<UIStoragePanelWrapperDetails
                {...StoragePanelWrapperStory.args}
                children={<UIStoragePanel
                    {...StoragePanelStory.args}
                    children={getPanelChildren(2)}
                />}
            />}
        />}
    />,
};

export const EmptyData: Story = {
    render: () => <UIAppLayout
        header={<UIHeader {...UIHeaderSingleBankStory.args} />}
        bottom={<UIActionsPanel
            data={[]}
            onSave={console.log}
        />}
        footer={<UIFooter />}
        children={<UIStorageContent
            id='move-container'
            left={<UIStoragePanelWrapperDetails
                {...StoragePanelWrapperEmptyStory.args}
                children={<UIStoragePanel
                    {...StoragePanelEmptyStory.args}
                />}
            />}
            right={<UIStoragePanelWrapperDetails
                {...StoragePanelWrapperEmptyStory.args}
                children={<UIStoragePanel
                    {...StoragePanelEmptyStory.args}
                />}
            />}
        />}
    />,
};
