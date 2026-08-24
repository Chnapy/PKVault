import { Box, Checkbox, Tabs, Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import gameXImg from '../../../assets/game_icons/x.png';
import { BoxType, GameVersion, Gender } from '../../../data/sdk/model';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
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
import { UIBoxExpanded } from './box-list/ui-box-expanded';
import { UIStoragePanelBoxList } from './box-list/ui-storage-panel-box-list';
import { UIGameExpanded } from './game-list/ui-game-expanded';
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
                { id: 'pkvault', imgSrc: '/logo.svg', label: 'PKVault' },
                { id: 'x1', imgSrc: gameXImg, label: 'Pokemon X' },
                { id: 'x2', imgSrc: gameXImg, label: 'Pokemon X' },
                { id: 'x3', imgSrc: gameXImg, label: 'Pokemon X' },
            ]}
            onChange={console.log}
            createActions={null}
            sortValue='1'
            sortData={[
                {
                    value: '1',
                    label: '1',
                },
                {
                    value: '2',
                    label: '2',
                },
                {
                    value: '3',
                    label: '3',
                },
            ]}
            onSortChange={console.log}
            renderExpanded={(data, { reduce }) => data.map(({ item, selected }) =>
                <UIGameExpanded
                    key={item.id}
                    {...item}
                    selected={selected}
                    onSelect={reduce}
                    generation='G5'
                    language='ENG'
                    ot='CHNAPY'
                    otGender={Gender.Male}
                    ownedCount={45}
                    path='./foo/bar.sav'
                    playTime='12:14:20'
                    tid={12345}
                />)}
            renderHoverCard={() => <UIGameExpanded
                id={'1'}
                generation={'G1'}
                ot={'CHNAPY'}
                otGender={Gender.Male}
                tid={12345}
                ownedCount={142}
                playTime={'120:16:10'}
                language={'FRE'}
                onSelect={console.log}
                editDropdown={'foo'}
                label={'Pokemon Blue'}
                imgSrc={getGameInfos(GameVersion.BU).img}
                path={'/foo/bar/path.srm'}
            />}
        />,
        header: <UIStoragePanelBoxList
            value='1'
            data={[
                { id: '1', label: 'Party', type: BoxType.Party },
                { id: '2', label: 'Box 2', type: BoxType.Box },
                { id: '3', label: 'Box 3', type: BoxType.Box },
                { id: '4', label: 'Box 4', type: BoxType.Box },
                { id: '5', label: 'Box 5', type: BoxType.Box },
                { id: '6', label: 'Box 6', type: BoxType.Box },
                { id: '7', label: 'Box 7', type: BoxType.Box },
                { id: '8', label: 'Box 8', type: BoxType.Box },
                { id: '9', label: 'Box 9', type: BoxType.Box },
                { id: '10', label: 'Box 10', type: BoxType.Box },
                { id: '11', label: 'Box 11', type: BoxType.Box },
                { id: '12', label: 'Box 12', type: BoxType.Box },
                { id: '13', label: 'Box 13', type: BoxType.Box },
                { id: '14', label: 'Box 14', type: BoxType.Box },
            ]}
            onSelect={console.log}
            renderTab={({ item, i, selected }, { reduce }) => <Tabs.Tab
                key={item.id}
                value={item.id}
                onClick={reduce}
                disabled={i === 5}
                py={0}
                style={{ gap: 4 }}
                rightSection={selected && <Checkbox
                    size='xs'
                />}
            >
                <Text component={selected ? 'b' : undefined} textWrap='nowrap'>{item.label}</Text>
            </Tabs.Tab>}
            renderExpanded={(data, { reduce }) => data.map(({ item, selected }) => <UIBoxExpanded
                key={item.id}
                id={item.id}
                label={item.label}
                selected={selected}
                onSelect={reduce}
                slotsStates={[ true, true, false, false, false, true ]}
                editDropdown='edit'
                onDelete={console.log}
            />)}
            advancedActionSort='advancedActionSort'
            advancedDexSync='advancedDexSync'
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
                { id: 'pkvault', imgSrc: '/logo.svg', label: 'PKVault' },
            ]}
            onChange={console.log}
            createActions={null}
            sortValue='1'
            sortData={[
                {
                    value: '1',
                    label: '1',
                },
                {
                    value: '2',
                    label: '2',
                },
                {
                    value: '3',
                    label: '3',
                },
            ]}
            onSortChange={console.log}
            renderExpanded={(data, { reduce }) => data.map(({ item, selected }) =>
                <UIGameExpanded
                    key={item.id}
                    {...item}
                    selected={selected}
                    onSelect={reduce}
                    generation='G5'
                    language='ENG'
                    ot='CHNAPY'
                    otGender={Gender.Male}
                    ownedCount={45}
                    path='./foo/bar.sav'
                    playTime='12:14:20'
                    tid={12345}
                />)}
            renderHoverCard={() => <UIGameExpanded
                id={'1'}
                generation={'G1'}
                ot={'CHNAPY'}
                otGender={Gender.Male}
                tid={12345}
                ownedCount={142}
                playTime={'120:16:10'}
                language={'FRE'}
                onSelect={console.log}
                editDropdown={'foo'}
                label={'Pokemon Blue'}
                imgSrc={getGameInfos(GameVersion.BU).img}
                path={'/foo/bar/path.srm'}
            />}
        />,
        header: <UIStoragePanelBoxList
            value='1'
            data={[
                { id: '1', label: 'Box 1', type: BoxType.Box },
            ]}
            onSelect={console.log}
            renderTab={({ item, i, selected }, { reduce }) => <Tabs.Tab
                key={item.id}
                value={item.id}
                onClick={reduce}
                disabled={i === 5}
                py={0}
                style={{ gap: 4 }}
                rightSection={selected && <Checkbox
                    size='xs'
                />}
            >
                <Text component={selected ? 'b' : undefined} textWrap='nowrap'>{item.label}</Text>
            </Tabs.Tab>}
            renderExpanded={(data, { reduce }) => data.map(({ item, selected }) => <UIBoxExpanded
                key={item.id}
                id={item.id}
                label={item.label}
                selected={selected}
                onSelect={reduce}
                slotsStates={[ true, true, false, false, false, true ]}
                editDropdown='edit'
                onDelete={console.log}
            />)}
            advancedActionSort='advancedActionSort'
            advancedDexSync='advancedDexSync'
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
