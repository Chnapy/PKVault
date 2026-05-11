import { Button, Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkIcon, MoveIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { fn } from 'storybook/test';
import gameXImg from '../../assets/game_icons/x.png';
import { GameVersion, Gender, MarkingColorUniversal, MoveCategory } from '../../data/sdk/model';
import { UIItemImg } from '../sprite-img/item-img/ui-item-img';
import { UISpeciesImg } from '../sprite-img/species-img/ui-species-img';
import { UIBallImg } from '../sprite-img/ui-ball-img';
import { UIGameImg } from '../sprite-img/ui-game-img';
import spritesheetItem0 from '../stories/assets/spritesheet_items_0.webp';
import spritesheet0 from "../stories/assets/spritesheet_species_0.webp";
import { UITypeItem } from '../type-item/ui-type-item';
import { UIContest } from './content/cosmetic/ui-contest';
import { UIDetailsContentCosmetic } from './content/cosmetic/ui-details-content-cosmetic';
import { UIRibbon, type UIRibbonProps } from './content/cosmetic/ui-ribbon';
import { UIDetailsContentMisc } from './content/misc/ui-details-content-misc';
import { UIDetailsContentMove } from './content/moves/ui-details-content-moves';
import { UIDetailsMoveRow, type UIDetailsMoveRowProps } from './content/moves/ui-details-move-row';
import { UIDetailsContentOrigin } from './content/origin/ui-details-content-origin';
import { UIDetailsContentStats } from './content/stats/ui-details-content-stats';
import { UIDetailsStatsRow, type UIDetailsStatsRowProps } from './content/stats/ui-details-stats-row';
import { UIDetailsContent } from './content/ui-details-content';
import { UIDetailsContentSummary } from './content/ui-details-content-summary';
import { UIMarkingList } from './marking/ui-marking-list';
import { UIDetailsMain } from './ui-details-main';
import { UIDetailsSaves } from './ui-details-saves';
import { UIStorageDetails } from './ui-storage-details';

const meta = {
    title: 'UI/UIStorageDetails',
    component: UIStorageDetails,
    decorators: [
        Story => <div style={{ width: 300, margin: 16 }}>
            <Story />
        </div>,
    ],
} satisfies Meta<typeof UIStorageDetails>;

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
            actions={closeBtn}
        />,
        main: <UIDetailsMain
            species={68}
            speciesName={'Machamp'}
            gender={Gender.Male}
            isShiny={true}
            // isAlpha={}
            types={<>
                <UITypeItem type={2} name='Fighting' />
                <UITypeItem type={3} name='Flight' />
            </>}
            // teraType={}
            heldItem={<UIItemImg
                item={209}
                sheetUrl={spritesheetItem0}
                spriteInfos={{
                    height: 30,
                    width: 30,
                    x: 992,
                    y: 192,
                }}
                dropShadow
            />}
            markings={<UIMarkingList markings={[
                MarkingColorUniversal.Marked,
                MarkingColorUniversal.MarkedBlue,
                MarkingColorUniversal.MarkedPink,
                MarkingColorUniversal.NotMarked,
                MarkingColorUniversal.NotMarked,
                MarkingColorUniversal.NotMarked,
            ]} />}
            ball={<UIBallImg
                item={2}
                sheetUrl={spritesheetItem0}
                spriteInfos={{
                    height: 30,
                    width: 30,
                    x: 1504,
                    y: 96
                }}
            />}
            nickname={'Bipboup'}
            level={50}
            // eggHatchCount={}
            pokerusDays={2}
            // isPokerusCured={}
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
        content: <UIDetailsContent
            summary={<UIDetailsContentSummary
                heldItem={<Group gap={4}>
                    <UIItemImg
                        item={209}
                        sheetUrl={spritesheetItem0}
                        spriteInfos={{
                            height: 30,
                            width: 30,
                            x: 992,
                            y: 192,
                        }}
                    />
                    Mystic Water
                </Group>}
                nature='Impish'
                ability='Guts'
                pid='51853507'
            />}
            stats={<UIDetailsContentStats>
                {[
                    {
                        stat: 'hp',
                        value: 55,
                        iv: 23,
                        ev: 6,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'atk',
                        value: 50,
                        iv: 0,
                        ev: 0,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'def',
                        value: 45,
                        iv: 12,
                        ev: 0,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'spa',
                        value: 135,
                        iv: 31,
                        ev: 252,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'spd',
                        value: 95,
                        iv: 28,
                        ev: 0,
                    } satisfies UIDetailsStatsRowProps,
                    {
                        stat: 'spe',
                        value: 120,
                        iv: 5,
                        ev: 252,
                    } satisfies UIDetailsStatsRowProps,
                ].map((props) => <UIDetailsStatsRow key={props.stat} {...props} />)}
            </UIDetailsContentStats>}
            moves={<UIDetailsContentMove>
                {[
                    {
                        type: 5,
                        name: 'Bomb-beurk',
                        category: MoveCategory.SPECIAL,
                        power: 95,
                        accuracy: 100,
                    } satisfies UIDetailsMoveRowProps,
                    {
                        type: 8,
                        name: 'Foobar',
                        category: MoveCategory.PHYSICAL,
                        power: 140,
                        accuracy: 70,
                    } satisfies UIDetailsMoveRowProps,
                    {
                        type: 10,
                        name: 'Toto',
                        category: MoveCategory.STATUS,
                    } satisfies UIDetailsMoveRowProps,
                    // {
                    //     type: 5,
                    //     name: 'Bomb-beurk',
                    //     category: MoveCategory.SPECIAL,
                    //     power: 95,
                    //     accuracy: 100,
                    // } satisfies UIDetailsMoveRowProps,
                ].map(props => <UIDetailsMoveRow key={props.name} {...props} />)}
            </UIDetailsContentMove>}
            contest={<UIDetailsContentCosmetic
                contest={[ 45, 0, 0, 255, 147, 0 ].map((value, i) => <UIContest key={i} index={i} value={value} />)}
                ribbons={[
                    {
                        spriteKey: 'ribbonalert',
                        name: 'Foobar',
                        count: 1
                    } satisfies UIRibbonProps,
                    {
                        spriteKey: 'ribbonearth',
                        name: 'Barfoo',
                        count: 3
                    } satisfies UIRibbonProps,
                ].map(props => <UIRibbon key={props.name} {...props} />)}
            />}
            origin={<UIDetailsContentOrigin
                game={<Group>
                    <UIGameImg
                        size='1lh'
                        version={GameVersion.ZA}
                        name='Pokemon Legends ZA'
                    />
                    Pokemon Legends Z-A
                </Group>}
                ot='CHNAPY'
                otGender={Gender.Male}
                ht='ZOOBA'
                htGender={Gender.Female}
                tid={54128}
                originMetLocation='Wild Zone 4'
                originMetLevel={17}
                originMetDate={'2025-10-17'}
                fatefulEncounter
            />}
            misc={<UIDetailsContentMisc
                language='English'
                homeTracker={0}
            />}
        />,
        actions: <>
            <Button
                size='compact-md'
                leftSection={<MoveIcon size={16} />}
            >Move</Button>
            <Button
                size='compact-md'
                leftSection={<Group gap='sm'>
                    <MoveIcon size={16} />
                    <LinkIcon size={16} />
                </Group>}
            >Move attached</Button>
            <Button
                variant='filled'
                color='blue'
                size='compact-md'
                leftSection={<PencilIcon size={16} />}
            >Edit</Button>
            <Button
                variant='filled'
                color='red'
                size='compact-md'
                leftSection={<TrashIcon size={16} />}
            >Release</Button>
        </>,
        onClose: fn(),
    },
};
