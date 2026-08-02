import { Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderIcon } from 'lucide-react';
import { GameVersion, Gender } from '../../../data/sdk/model';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import { UIButton } from '../../form/button/ui-button';
import { UISegmentedControl } from '../../form/select/ui-segmented-control';
import { UIAlphaIcon } from '../../icon/ui-alpha-icon';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIGender } from '../../icon/ui-gender';
import { UIShinyIcon } from '../../icon/ui-shiny-icon';
import { UISpeciesImg } from '../../sprite-img/species-img/ui-species-img';
import { UIDetailsContentStats } from '../../storage/storage-details/content/stats/ui-details-content-stats';
import { UIDetailsStatsRow, type UIDetailsStatsRowProps } from '../../storage/storage-details/content/stats/ui-details-stats-row';
import { UIDetailsContent, type UIDetailsContentProps } from '../../storage/storage-details/content/ui-details-content';
import { UIDetailsContentExpanded } from '../../storage/storage-details/content/ui-details-content-expanded';
import { UIDetailsSaveTab } from '../../storage/storage-details/saves/ui-details-save-tab';
import { UIDetailsSaves } from '../../storage/storage-details/saves/ui-details-saves';
import spritesheet0 from "../../stories/assets/spritesheet_species_0.webp";
import { UITypeItem } from '../../type-item/ui-type-item';
import { UIPokedexDetails } from './ui-pokedex-details';
import { UIPokedexDetailsMain } from './ui-pokedex-details-main';

const meta = {
    title: 'UI/UIPokedexDetails',
    component: UIPokedexDetails,
} satisfies Meta<typeof UIPokedexDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

const getContent = (): UIDetailsContentProps[ 'content' ] => [
    {
        name: 'stats',
        label: 'Stats',
        content: <UIDetailsContentStats>
            {[
                {
                    stat: 'hp',
                    value: 55,
                    level: 50,
                } satisfies UIDetailsStatsRowProps,
                {
                    stat: 'atk',
                    value: 50,
                    level: 50,
                } satisfies UIDetailsStatsRowProps,
                {
                    stat: 'def',
                    value: 45,
                    level: 50,
                } satisfies UIDetailsStatsRowProps,
                {
                    stat: 'spa',
                    value: 135,
                    level: 50,
                } satisfies UIDetailsStatsRowProps,
                {
                    stat: 'spd',
                    value: 95,
                    level: 50,
                } satisfies UIDetailsStatsRowProps,
                {
                    stat: 'spe',
                    value: 120,
                    level: 50,
                } satisfies UIDetailsStatsRowProps,
            ].map((props) => <UIDetailsStatsRow key={props.stat} {...props} />)}
        </UIDetailsContentStats>,
    },
    {
        name: 'moves',
        label: 'Moves',
        content: 'WIP',
    },
    {
        name: 'evolutions',
        label: 'Evolutions',
        content: 'WIP',
    },
    {
        name: 'locations',
        label: 'Locations',
        content: 'WIP',
    },
    {
        name: 'misc',
        label: 'Misc',
        content: 'WIP',
    },
];

export const Primary: Story = {
    decorators: [
        Story => <div style={{ width: 300, margin: 16 }}>
            <Story />
        </div>,
    ],
    args: {
        expanded: false,
        header: closeBtn => <UIDetailsSaves
            value='5'
            data={[
                // { id: '1', imgSrc: '/logo.svg', label: 'PKVault' },
                { id: '5', imgSrc: getGameInfos(GameVersion.X).img, label: 'G1' },
                { id: '6', imgSrc: getGameInfos(GameVersion.X).img, label: 'G5' },
                { id: '2', imgSrc: getGameInfos(GameVersion.X).img, label: 'G6' },
                { id: '3', imgSrc: getGameInfos(GameVersion.X).img, label: 'G7' },
                { id: '7', imgSrc: getGameInfos(GameVersion.X).img, label: 'G7b' },
                { id: '4', imgSrc: getGameInfos(GameVersion.X).img, label: 'G9a' },
            ]}
            onSelect={console.log}
            actions={closeBtn}
            renderTab={({ item, i, selected }) => <UIDetailsSaveTab
                id={item.id}
                version={GameVersion.X}
                color={getGameInfos(GameVersion.X).color}
                selected={selected}
                label={item.label}
                isEnabled={i !== 4}
                isMain={!i}
                warning={i === 5}
            />}
        />,
        main: <UIPokedexDetailsMain
            species={68}
            speciesName={'Machamp'}
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
        content: <UIDetailsContent content={getContent()} />,
        onExpand: console.log,
        onClose: console.log,
    },
};

export const Expanded: Story = {
    args: {
        ...Primary.args,
        expanded: true,
        content: <UIDetailsContentExpanded content={getContent()} />,
    },
};
