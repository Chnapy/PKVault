import { Card, Group } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataActionType, GameVersion, Gender } from '../../../data/sdk/model';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import { UIActionsPanel } from '../../actions-panel/ui-actions-panel';
import { UIAppLayout } from '../../layout/app-layout/ui-app-layout';
import { UIFooter } from '../../layout/footer/ui-footer';
import { UIHeader } from '../../layout/header/ui-header';
import { Primary as UIHeaderStory } from '../../layout/header/ui-header.stories';
import { UISavesContent } from '../../saves/ui-saves-content';
import { UIGameExpanded } from '../../storage/storage-panel/game-list/ui-game-expanded';

const meta = {
    title: 'Pages/Saves',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    render: () => <UIAppLayout
        header={<UIHeader
            {...UIHeaderStory.args}
            value='saves'
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
            onDelete={index => Promise.resolve(console.log(index))}
            onSave={() => Promise.resolve(console.log('save'))}
        />}
        footer={<UIFooter />}
        children={<UISavesContent>

            <Card style={{ overflow: 'auto' }}>
                <Card.Section inheritPadding withBorder py='inherit'>
                    Generation 1
                </Card.Section>
                <Card.Section inheritPadding withBorder py='inherit'>
                    <Group>
                        <UIGameExpanded
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
                        />
                        <UIGameExpanded
                            id={'2'}
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
                        />
                    </Group>
                </Card.Section>

                <Card.Section inheritPadding withBorder py='inherit'>
                    Generation 2
                </Card.Section>
                <Card.Section inheritPadding withBorder py='inherit'>
                    <UIGameExpanded
                        id={'3'}
                        generation={'G2'}
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
                    />
                </Card.Section>
            </Card>
        </UISavesContent>}
    />,
};
