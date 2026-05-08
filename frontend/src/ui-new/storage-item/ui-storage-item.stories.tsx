import { Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UIAlphaIcon } from '../icon/ui-alpha-icon';
import { UIIconWrapper } from '../icon/ui-icon-wrapper';
import { UIShinyIcon } from '../icon/ui-shiny-icon';
import { UISpeciesImg } from '../sprite-img/ui-species-img';
import spritesheet0 from "../stories/assets/spritesheet_species_0.webp";
import { UIStorageItem } from './ui-storage-item';

const meta = {
    title: 'UI/UIStorageItem',
    component: UIStorageItem,
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
            size='small'
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
