import { Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import spritesheet0 from "../stories/assets/spritesheet_species_0.webp";
import { UIAlphaIcon } from './ui-alpha-icon';
import { UIIconWrapper } from './ui-icon-wrapper';
import { UIShinyIcon } from './ui-shiny-icon';
import { UISpeciesImg } from './ui-species-img';
import { UIStorageItem } from './ui-storage-item';

const meta = {
    title: 'UI/UIStorageItem',
    component: UIStorageItem,
    tags: [ 'autodocs' ],
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
                sheetName: "spritesheet_species_0.webp",
                width: 96,
                x: 1536,
                y: 1408,
            }}
        />
    },
};

export const Small: Story = {
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
            small
            sheetUrl={spritesheet0}
            species={68}
            spriteInfos={{
                height: 96,
                sheetName: "spritesheet_species_0.webp",
                width: 96,
                x: 1536,
                y: 1408,
            }}
        />
    },
};
