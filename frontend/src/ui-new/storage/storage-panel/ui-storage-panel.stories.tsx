import { Box } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import gameXImg from '../../../assets/game_icons/x.png';
import { Gender } from '../../../data/sdk/model';
import type { MoveTargetInput } from '../../interaction/move/context/move-context';
import { MoveProvider } from '../../interaction/move/context/move-provider';
import type { MoveSource } from '../../interaction/move/state/move-state';
import type { SelectContext } from '../../interaction/select/context/select-context';
import { SelectProvider } from '../../interaction/select/context/select-provider';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import { UIStorageItemPlaceholder } from '../storage-item/placeholder/ui-storage-item-placeholder';
import { Primary as StorageItemPlaceholder } from '../storage-item/placeholder/ui-storage-item-placeholder.stories';
import { UIStorageItem } from '../storage-item/ui-storage-item';
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
    decorators: Story => {
        return getMoveSelectDecorator(Story);
    },
} satisfies Meta<typeof UIStoragePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getMoveSelectDecorator = (Story: any) => {

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

    return <SelectProvider {...containerFns}>
        <MoveProvider moveContainerId='move-container'
            {...containerFns}
            useFilterStartDragIds={(container, sourceIds) => () => new Set(sourceIds)}
            getTargetAllPositions={() => ({})} onDrop={onDrop}
            dragStartComputeSlotStates={source => ({
                rootItems: {},
                items: {},
            })}
        >
            <Box
                id='move-container' pos='relative'
            >
                <Story />
            </Box>
        </MoveProvider>
    </SelectProvider>;
};

export const getPanelChildren = (box: number) => new Array(30).fill(0).map((_, i) =>
    i % 7 === 0
        ? <UIStorageItemPlaceholder
            key={i}
            {...StorageItemPlaceholder.args}
            nodeId={i + ''}
            container={{
                bank: 1,
                saveId: null,
                box: box,
            }}
            slot={i}
        />
        : <UIStorageItem
            key={i}
            {...StorageItemPrimary.args}
            nodeId={i + ''}
            id={`item-${box}-${i}`}
            container={{
                bank: 1,
                saveId: null,
                box: box,
            }}
            slot={i}
            onClick={() => console.log('click', i)}
        />);

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
                { id: '1', label: 'Party' },
                { id: '2', label: 'Box 2' },
                { id: '3', label: 'Box 3' },
                { id: '4', label: 'Box 4' },
                { id: '5', label: 'Box 5' },
                { id: '6', label: 'Box 6' },
                { id: '7', label: 'Box 7' },
                { id: '8', label: 'Box 8' },
                { id: '9', label: 'Box 9' },
                { id: '10', label: 'Box 10' },
                { id: '11', label: 'Box 11' },
                { id: '12', label: 'Box 12' },
                { id: '13', label: 'Box 13' },
                { id: '14', label: 'Box 14' },
            ]}
            onSelect={console.log}
        />,
        children: getPanelChildren(1),
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
                { id: '1', label: 'Box 1' },
            ]}
            onSelect={console.log}
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
