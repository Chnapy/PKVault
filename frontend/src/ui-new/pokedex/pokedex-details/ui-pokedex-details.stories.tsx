import { Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderIcon } from 'lucide-react';
import gameXImg from '../../../assets/game_icons/x.png';
import { Gender } from '../../../data/sdk/model';
import { UIButton } from '../../form/button/ui-button';
import { UISegmentedControl } from '../../form/select/ui-segmented-control';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UISpeciesImg } from '../../sprite-img/species-img/ui-species-img';
import { UIDetailsContentStats } from '../../storage/storage-details/content/stats/ui-details-content-stats';
import { UIDetailsStatsRow, type UIDetailsStatsRowProps } from '../../storage/storage-details/content/stats/ui-details-stats-row';
import { UIDetailsSaves } from '../../storage/storage-details/saves/ui-details-saves';
import spritesheet0 from "../../stories/assets/spritesheet_species_0.webp";
import { UITypeItem } from '../../type-item/ui-type-item';
import { UIPokedexDetailsContent } from './content/ui-pokedex-details-content';
import { UIPokedexDetails } from './ui-pokedex-details';
import { UIPokedexDetailsMain } from './ui-pokedex-details-main';

const meta = {
    title: 'UI/UIPokedexDetails',
    component: UIPokedexDetails,
    decorators: [
        Story => <div style={{ width: 300, margin: 16 }}>
            <Story />
        </div>,
    ],
} satisfies Meta<typeof UIPokedexDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        header: closeBtn => <UIDetailsSaves
            value='5'
            data={[
                // { id: '1', imgSrc: '/logo.svg', label: 'PKVault' },
                { id: '5', imgSrc: gameXImg, label: 'G1' },
                { id: '6', imgSrc: gameXImg, label: 'G5' },
                { id: '2', imgSrc: gameXImg, label: 'G6' },
                { id: '3', imgSrc: gameXImg, label: 'G7' },
                { id: '7', imgSrc: gameXImg, label: 'G7b' },
                { id: '4', imgSrc: gameXImg, label: 'G9a' },
            ]}
            onSelect={console.log}
            actions={closeBtn}
        />,
        main: <UIPokedexDetailsMain
            species={68}
            speciesName={'Machamp'}
            form='Alola'
            gender={Gender.Male}
            isShiny
            isAlpha
            isSeen
            isCaught
            isOwned
            types={<>
                <UITypeItem type={2} name='Fighting' />
                <UITypeItem type={3} name='Flight' />
            </>}
            children={<UISpeciesImg
                species={68}
                sheetUrl={spritesheet0}
                spriteInfos={{
                    height: 96,
                    width: 96,
                    x: 1536,
                    y: 1408,
                }}
                dropShadow
            />}
        />,
        items: <>
            <UISegmentedControl
                name='forms'
                controlLabel='Change form'
                data={[
                    {
                        value: '',
                        label: 'Default',
                    },
                    {
                        value: 'alola',
                        label: 'Alola',
                        disabled: true,
                    },
                    {
                        value: 'totem',
                        label: 'Totem',
                    },
                ]}
                onChange={console.log}
                focusOnMount
            // bdrs={0}
            />

            <Group p='md'>
                {[
                    {
                        value: '68-0-0',
                        label: <Group wrap='nowrap' gap='sm'>
                            <UIGender gender={Gender.Male} />
                            <UIBallIcon />
                            <FolderIcon />
                            <UIShinyIcon />
                        </Group>,
                    },
                    {
                        value: '68-0-1',
                        label: <Group wrap='nowrap' gap='sm'>
                            <UIGender gender={Gender.Female} />
                            <UIAlphaIcon />
                        </Group>,
                    },
                ].map(item => <UIButton
                    key={item.value}
                    name={item.value}
                    controlLabel='Foo'
                    size='xs'
                >
                    {item.label}
                </UIButton>)}
            </Group>
        </>,
        content: <UIPokedexDetailsContent
            stats={<UIDetailsContentStats>
                {[
                    {
                        stat: 'hp',
                        value: 55,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'atk',
                        value: 50,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'def',
                        value: 45,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'spa',
                        value: 135,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'spd',
                        value: 95,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'spe',
                        value: 120,
                    } satisfies UIDetailsStatsRowProps,
                ].map((props) => <UIDetailsStatsRow key={props.stat} {...props} />)}
            </UIDetailsContentStats>}
            moves={'TODO'}
            evolutions={'TODO'}
            locations={'TODO'}
            misc={'TODO'}
        />,
        onClose: console.log,
    },
};
