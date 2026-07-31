import { Card } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Gender } from '../../../data/sdk/model';
import { UISpeciesImg } from '../../sprite-img/species-img/ui-species-img';
import { UISpriteSizeWrapper } from '../../sprite-img/ui-sprite-size-wrapper';
import spritesheet0 from "../../stories/assets/spritesheet_species_0.webp";
import { UIPokedexFormItem } from './ui-pokedex-form-item';
import { UIPokedexItem } from './ui-pokedex-item';

const meta = {
    title: 'UI/UIPokedexItem',
    component: UIPokedexItem,
    decorators: Story => <Card display='inline-flex'>
        <Story />
    </Card>,
} satisfies Meta<typeof UIPokedexItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        id: '1',
        species: 68,
        form: 'alola',
        label: 'Machamp',
        onClick: console.log,
        children: <UIPokedexFormItem
            genders={[ Gender.Male, Gender.Female ]}
            isSeen
            isSeenAlpha
            isCaught
            isOwned
        >
            <UISpeciesImg
                sheetUrl={spritesheet0}
                species={68}
                spriteInfos={{
                    height: 96,
                    width: 96,
                    x: 1536,
                    y: 1408,
                }}
            />
        </UIPokedexFormItem>
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
