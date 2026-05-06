import type { Meta, StoryObj } from '@storybook/react-vite';
import gameXImg from '../../assets/game_icons/x.png';
import { UIStorageItem } from '../storage-item/ui-storage-item';
import { UIStorageItemPlaceholder } from '../storage-item/ui-storage-item-placeholder';
import { Primary as StorageItemPlaceholder } from '../storage-item/ui-storage-item-placeholder.stories';
import { Primary as StorageItemPrimary } from '../storage-item/ui-storage-item.stories';
import { UIStoragePanel } from './ui-storage-panel';
import { UIStoragePanelBoxList } from './ui-storage-panel-box-list';
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
            data={[
                { value: 'pkvault', imgSrc: '/logo.svg', label: 'PKVault', selected: true },
                { value: 'x', imgSrc: gameXImg, label: 'Pokemon X' },
                { value: 'x', imgSrc: gameXImg, label: 'Pokemon X' },
                { value: 'x', imgSrc: gameXImg, label: 'Pokemon X' },
            ]}
        />,
        header: <UIStoragePanelBoxList
            data={[
                { value: '1', label: 'Box 1', selected: true },
                { value: '2', label: 'Box 2' },
                { value: '3', label: 'Box 3' },
                { value: '4', label: 'Box 4' },
                { value: '5', label: 'Box 5' },
                { value: '6', label: 'Box 6' },
                { value: '7', label: 'Box 7' },
                { value: '8', label: 'Box 8' },
                { value: '9', label: 'Box 9' },
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
