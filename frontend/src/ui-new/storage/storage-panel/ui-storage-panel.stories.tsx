import { Box } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import gameXImg from '../../../assets/game_icons/x.png';
import { Gender } from '../../../data/sdk/model';
import { FocusControlsProvider } from '../../interaction/focus-controls/provider/focus-controls-provider';
import type { MoveTargetInput } from '../../interaction/move/context/move-context';
import { MoveProvider } from '../../interaction/move/context/move-provider';
import type { MoveSource } from '../../interaction/move/state/move-state';
import type { SelectContext } from '../../interaction/select/context/select-context';
import { SelectProvider } from '../../interaction/select/context/select-provider';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIStorageItemPlaceholder } from '../storage-item/placeholder/ui-storage-item-placeholder';
import { UIStorageItemPlaceholderWithInteraction } from '../storage-item/placeholder/ui-storage-item-placeholder-with-interaction';
import { Primary as StorageItemPlaceholder } from '../storage-item/placeholder/ui-storage-item-placeholder.stories';
import { UIStorageItem } from '../storage-item/ui-storage-item';
import { UIStorageItemWithInteraction } from '../storage-item/ui-storage-item-with-interaction';
import { Primary as StorageItemPrimary } from '../storage-item/ui-storage-item.stories';
import { UIStoragePanelBoxList } from './box-list/ui-storage-panel-box-list';
import { UIStoragePanelGameList } from './game-list/ui-storage-panel-game-list';
import { UIStoragePanel } from './ui-storage-panel';
import { UIStoragePanelFooter } from './ui-storage-panel-footer';

const meta = {
    title: 'UI/UIStoragePanel',
    component: UIStoragePanel,
    parameters: {
        layout: 'padded',
    },
    excludeStories: /get.*/,
} satisfies Meta<typeof UIStoragePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        gameTabs: <UIStoragePanelGameList
            value='pkvault'
            data={[
                { id: 'pkvault', imgSrc: '/logo.svg', label: 'PKVault', ot: 'Chnapy', otGender: Gender.Male, tid: 54123, lastSync: '2026-04-28', path: 'C:/foo/bar/save.bin' },
                { id: 'x1', imgSrc: gameXImg, label: 'Pokemon X', ot: 'Chnapy', otGender: Gender.Male, tid: 54123, lastSync: '2026-04-28', path: 'C:/foo/bar/save.bin' },
                { id: 'x2', imgSrc: gameXImg, label: 'Pokemon X', ot: 'Chnapy', otGender: Gender.Male, tid: 54123, lastSync: '2026-04-28', path: 'C:/foo/bar/save.bin' },
                { id: 'x3', imgSrc: gameXImg, label: 'Pokemon X', ot: 'Chnapy', otGender: Gender.Male, tid: 54123, lastSync: '2026-04-28', path: 'C:/foo/bar/save.bin' },
            ]}
            onChange={console.log}
        />,
        header: <UIStoragePanelBoxList
            value='1'
            data={[
                { id: '1', label: 'Party', slotsStates: new Array(6).fill(0).map((_, i) => !(i % 2)) },
                { id: '2', label: 'Box 2', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 2)) },
                { id: '3', label: 'Box 3', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 3)) },
                { id: '4', label: 'Box 4', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 4)) },
                { id: '5', label: 'Box 5', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 5)) },
                { id: '6', label: 'Box 6', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 6)) },
                { id: '7', label: 'Box 7', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 7)) },
                { id: '8', label: 'Box 8', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 8)) },
                { id: '9', label: 'Box 9', slotsStates: new Array(30).fill(0).map((_, i) => !!(i % 9)) },
            ]}
            onSelect={console.log}
            onDelete={console.log}
        />,
        children: new Array(30).fill(0).map((_, i) =>
            i % 7 === 0
                ? <UIStorageItemPlaceholder key={i} {...StorageItemPlaceholder.args} />
                : <UIStorageItem key={i} {...StorageItemPrimary.args} />),
        footer: <UIStoragePanelFooter
            boxSize={30}
            pkmCount={17}
            pkmTotalCount={142}
        />,
    },
};

export const EmptyData: Story = {
    args: {
        gameTabs: <UIStoragePanelGameList
            value='pkvault'
            data={[
                { id: 'pkvault', imgSrc: '/logo.svg', label: 'PKVault', ot: 'Chnapy', otGender: Gender.Male, tid: 54123, lastSync: '2026-04-28', path: 'C:/foo/bar/save.bin' },
            ]}
            onChange={console.log}
        />,
        header: <UIStoragePanelBoxList
            value='1'
            data={[
                { id: '1', label: 'Box 1', slotsStates: [] },
            ]}
            onSelect={console.log}
            onDelete={console.log}
        />,
        children: null,
        footer: <UIStoragePanelFooter
            boxSize={30}
            pkmCount={0}
            pkmTotalCount={0}
        />,
    },
};

export const Small: Story = {
    args: {
        ...Primary.args,
    },
    decorators: Story => <UISpriteSizeWrapper
        component='div'
        speciesSize='sm'
    >
        <Story />
    </UISpriteSizeWrapper>,
};

export const getPanelInteractiveChildren = (box: number) => new Array(30).fill(0).map((_, i) =>
    i % 7 === 0
        ? <UIStorageItemPlaceholderWithInteraction
            key={i}
            {...StorageItemPlaceholder.args}
            bank='1'
            saveId={null}
            box={box}
            slot={i}
        />
        : <UIStorageItemWithInteraction
            key={i}
            {...StorageItemPrimary.args}
            id={`item-${box}-${i}`}
            bank='1'
            saveId={null}
            box={box}
            slot={i}
            onClick={() => console.log('click', i)}
        />);

export const WithInteraction: Story = {
    args: {
        ...Primary.args,
        children: getPanelInteractiveChildren(1),
    },
    decorators: [
        Story => {

            type ContainerValue = { box: number; };

            const containerFns: Pick<SelectContext<ContainerValue>, 'getContainerHash' | 'getContainerValue'> = {
                getContainerHash: value => value.box ? String(value.box) : '',
                getContainerValue: hash => ({ box: Number(hash) }),
            };

            const onDrop = async (source: MoveSource, target: MoveTargetInput<ContainerValue>) => {
                console.log('drop start', source, target);

                await new Promise(r => setTimeout(r, 500));

                console.log('drop end');
            };

            return <FocusControlsProvider>
                <SelectProvider<ContainerValue>
                    {...containerFns}
                >
                    <MoveProvider<ContainerValue>
                        {...containerFns}
                        moveContainerId='move-container'
                        getTargetAllPositions={() => ({})}
                        onDrop={onDrop}
                    >
                        <Box
                            id='move-container' pos='relative'
                        >
                            <Story />
                        </Box>
                    </MoveProvider>
                </SelectProvider>
            </FocusControlsProvider>;
        },
    ],
};
