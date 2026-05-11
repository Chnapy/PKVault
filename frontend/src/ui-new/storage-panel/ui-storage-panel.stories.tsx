import type { Meta, StoryObj } from '@storybook/react-vite';
import gameXImg from '../../assets/game_icons/x.png';
import { UISpriteSizeWrapper } from '../sprite-img/ui-sprite-size-wrapper';
import { UIStorageItem } from '../storage-item/ui-storage-item';
import { UIStorageItemPlaceholder } from '../storage-item/ui-storage-item-placeholder';
import { Primary as StorageItemPlaceholder } from '../storage-item/ui-storage-item-placeholder.stories';
import { Primary as StorageItemPrimary } from '../storage-item/ui-storage-item.stories';
import { UIStoragePanel } from './ui-storage-panel';
import { UIStoragePanelBoxList } from './box-list/ui-storage-panel-box-list';
import { UIStoragePanelFooter } from './ui-storage-panel-footer';
import { UIStoragePanelGameList } from './ui-storage-panel-game-list';

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
                { id: 'pkvault', imgSrc: '/logo.svg', label: 'PKVault' },
                { id: 'x1', imgSrc: gameXImg, label: 'Pokemon X' },
                { id: 'x2', imgSrc: gameXImg, label: 'Pokemon X' },
                { id: 'x3', imgSrc: gameXImg, label: 'Pokemon X' },
            ]}
        />,
        header: <UIStoragePanelBoxList
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
                { id: 'pkvault', imgSrc: '/logo.svg', label: 'PKVault' },
            ]}
        />,
        header: <UIStoragePanelBoxList
            data={[
                { id: '1', label: 'Box 1', slotsStates: [] },
            ]}
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
