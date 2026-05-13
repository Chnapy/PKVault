import { Card, Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIIconWrapper } from '../../icon/ui-icon-wrapper';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UISpeciesImg } from '../../sprite-img/species-img/ui-species-img';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import spritesheet0 from "../../stories/assets/spritesheet_species_0.webp";
import { UIStorageItem } from './ui-storage-item';

const meta = {
    title: 'UI/UIStorageItem',
    component: UIStorageItem,
    decorators: Story => <Card display='inline-flex'>
        <Story />
    </Card>,
} satisfies Meta<typeof UIStorageItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        label: 'Machamp Lv.50',
        icons: <Group justify='flex-end' gap={2} >
            <UIIconWrapper>
                <UIShinyIcon />
            </UIIconWrapper>
            <UIIconWrapper>
                <UIAlphaIcon />
            </UIIconWrapper>
        </Group>,
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
