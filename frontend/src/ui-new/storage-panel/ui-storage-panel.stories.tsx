import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import gameXImg from '../../assets/game_icons/x.png';
import { Gender } from '../../data/sdk/model';
import { UISpriteSizeWrapper } from '../sprite-img/ui-sprite-size-wrapper';
import { UIStorageItem } from '../storage-item/ui-storage-item';
import { UIStorageItemPlaceholder } from '../storage-item/ui-storage-item-placeholder';
import { Primary as StorageItemPlaceholder } from '../storage-item/ui-storage-item-placeholder.stories';
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
            onChange={fn()}
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
            onSelect={fn()}
            onDelete={fn()}
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
            onChange={fn()}
        />,
        header: <UIStoragePanelBoxList
            value='1'
            data={[
                { id: '1', label: 'Box 1', slotsStates: [] },
            ]}
            onSelect={fn()}
            onDelete={fn()}
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
