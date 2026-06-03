import { Card, Group, Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataActionType } from '../../../data/sdk/model';
import { UIActionsPanel } from '../../actions-panel/ui-actions-panel';
import { UIAppLayout } from '../../layout/app-layout/ui-app-layout';
import { UIFooter } from '../../layout/footer/ui-footer';
import { UIHeader } from '../../layout/header/ui-header';
import { Primary as UIHeaderStory } from '../../layout/header/ui-header.stories';
import { UIPokedexFilters } from '../../pokedex/filters/ui-pokedex-filters';
import { Primary as UIPokedexFiltersStory } from '../../pokedex/filters/ui-pokedex-filters.stories';
import { UIPokedexMainSection } from '../../pokedex/main/section/ui-pokedex-main-section';
import { UIPokedexMainSectionHeader } from '../../pokedex/main/section/ui-pokedex-main-section-header';
import { UIPokedexMain } from '../../pokedex/main/ui-pokedex-main';
import { UIPokedexMainWrapperDetails } from '../../pokedex/main/ui-pokedex-main-wrapper-details';
import { UIPokedexDetails } from '../../pokedex/pokedex-details/ui-pokedex-details';
import { Primary as UIPokedexDetailsStory } from '../../pokedex/pokedex-details/ui-pokedex-details.stories';
import { UIPokedexItem } from '../../pokedex/pokedex-item/ui-pokedex-item';
import { Primary as UIPokedexItemStory } from '../../pokedex/pokedex-item/ui-pokedex-item.stories';
import { UIPokedexContent } from '../../pokedex/ui-pokedex-content';

const meta = {
    title: 'Pages/Pokedex',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: () => <UIAppLayout
        header={<UIHeader
            {...UIHeaderStory.args}
        />}
        bottom={<UIActionsPanel
            data={[
                {
                    type: DataActionType.DATA_NORMALIZE,
                },
                {
                    type: DataActionType.MOVE_PKM,
                },
                {
                    type: DataActionType.MAIN_CREATE_BOX,
                },
                {
                    type: DataActionType.EVOLVE_PKM,
                },
                {
                    type: DataActionType.MAIN_DELETE_BANK,
                },
            ]}
            onSave={console.log}
        />}
        footer={<UIFooter />}
        children={<UIPokedexContent>
            <Group mah='100%' align='flex-start' wrap='nowrap'>
                <UIPokedexFilters
                    {...UIPokedexFiltersStory.args}
                    mah='100%' miw={300}
                />

                <UIPokedexMainWrapperDetails
                    details={<UIPokedexDetails
                        {...UIPokedexDetailsStory.args}
                    />}
                >
                    <Stack h='100%' style={{ flexGrow: 1 }}>
                        <UIPokedexMain mah='100%' style={{ flexGrow: 1 }}>
                            <Card.Section inheritPadding withBorder>
                                <UIPokedexMainSectionHeader
                                    generation='Generation 1'
                                    regions={[ 'Kanto' ]}
                                    seenCount={151}
                                    caughtCount={142}
                                    ownedCount={96}
                                    shinyCount={2}
                                    totalCount={151}
                                />
                            </Card.Section>
                            <Card.Section inheritPadding withBorder>
                                <UIPokedexMainSection>
                                    {new Array(30).fill(0).map((_, i) => <UIPokedexItem
                                        key={i}
                                        {...UIPokedexItemStory.args}
                                        id={`item-${i}`}
                                    />)}
                                </UIPokedexMainSection>
                            </Card.Section>

                            <Card.Section inheritPadding withBorder>
                                <UIPokedexMainSectionHeader
                                    generation='Generation 2'
                                    regions={[ 'Johto' ]}
                                    seenCount={151}
                                    caughtCount={142}
                                    ownedCount={96}
                                    shinyCount={2}
                                    totalCount={151}
                                />
                            </Card.Section>
                            <Card.Section inheritPadding withBorder>
                                <UIPokedexMainSection>
                                    {new Array(30).fill(0).map((_, i) => <UIPokedexItem
                                        key={i}
                                        {...UIPokedexItemStory.args}
                                        id={`item-${40 + i}`}
                                    />)}
                                </UIPokedexMainSection>
                            </Card.Section>
                        </UIPokedexMain>
                    </Stack>
                </UIPokedexMainWrapperDetails>
            </Group>
        </UIPokedexContent>}
    />,
};
