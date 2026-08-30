import { Card } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoveProvider } from '../../interaction/move/context/move-provider';
import { SelectProvider } from '../../interaction/select/context/select-provider';
import { UISpeciesImg } from '../../sprite-img/species-img/ui-species-img';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import spritesheet0 from "../../stories/assets/spritesheet_species_0.webp";
import { UIStorageItem } from './ui-storage-item';
import { UIStorageItemIcons } from './ui-storage-item-icons';

const meta = {
    title: 'UI/UIStorageItem',
    component: UIStorageItem,
    decorators: Story => <SelectProvider getContainerHash={() => ''} getContainerValue={() => null}>
        <MoveProvider moveContainerId='content'
            getContainerHash={() => ''} getContainerValue={() => null}
            useFilterStartDragIds={(container, sourceIds) => () => new Set(sourceIds)}
            getTargetAllPositions={() => ({})} onDrop={async () => null}
            dragStartComputeSlotStates={source => ({
                rootItems: {},
                items: {},
            })}
        >
            <Card id='content' display='inline-flex'>
                <Story />
            </Card>
        </MoveProvider>
    </SelectProvider>,
} satisfies Meta<typeof UIStorageItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        nodeId: '1',
        id: '1',
        container: {
            bank: '1',
            box: 1,
            saveId: null,
        },
        level: 50,
        name: 'Machamp',
        slot: 1,
        globalOrder: 0,
        selectFromPreviousSelected: () => null,
        icons: <UIStorageItemIcons
            heldItem={null}
            isStarter
            party={6}
            isAlpha
            isShiny
            level={50}
            nbrVariants={2}
            hasDisabledVariant
            isExternal
            canEvolve
            attached
            needSynchronize={false}
            isDuplicate
            warning
        />,
        children: <UISpeciesImg
            sheetUrl={spritesheet0}
            species={68}
            spriteInfos={{
                height: 96,
                width: 96,
                x: 1536,
                y: 1408,
            }}
        />
    },
    decorators: Story => <UISpriteSizeWrapper
        component='div'
        speciesSize='md'
    >
        <Story />
    </UISpriteSizeWrapper>,
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

export const Large: Story = {
    args: {
        ...Primary.args,
    },
    decorators: Story => <UISpriteSizeWrapper
        component='div'
        speciesSize='lg'
    >
        <Story />
    </UISpriteSizeWrapper>,
};
