import type { Meta, StoryObj } from '@storybook/react-vite';

import { ActionIcon, Box, Button, Card, Container, Grid, Stack, ThemeIcon } from '@mantine/core';
import { Primary as StorageClipboard } from '../storage-mid-panel/ui-storage-clipboard.stories';
import { UIStoragePanel } from '../storage-panel/ui-storage-panel';
import { Primary as StoragePanelPrimary } from '../storage-panel/ui-storage-panel.stories';
import { UIFrame } from './ui-frame';
import { UIHeader } from './ui-header';
import { UIHeaderItem } from './ui-header-item';
// import { UIIconWrapper } from './ui-icon-wrapper';
import { SortHorizontal } from 'pixelarticons/react';
import { UIStorageClipboard } from '../storage-mid-panel/ui-storage-clipboard';
import { UIBankList } from './ui-bank-list';
// import { UISpeciesImg } from './ui-species-img';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
    title: 'UI/UIFrame',
    component: UIFrame,
} satisfies Meta<typeof UIFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const WithHeader: Story = {
    args: {
        children: <>
            <UIHeader
                left={<>
                    <UIHeaderItem to='/saves'>SAVES</UIHeaderItem>
                    <UIHeaderItem to='/storage' selected>STORAGE</UIHeaderItem>
                    <UIHeaderItem to='/pokedex'>POKEDEX</UIHeaderItem>
                </>}
                right={<>
                    <UIHeaderItem to='/'>HELP</UIHeaderItem>
                    <UIHeaderItem to='/settings'>BACKUPS & SETTINGS</UIHeaderItem>
                </>}
                sub={<UIBankList
                    data={[
                        { value: '1', label: 'Bank 1', selected: true },
                        { value: '2', label: 'Bank 2' },
                        { value: '3', label: 'Bank 3' },
                        { value: '4', label: 'Bank 4' },
                        { value: '5', label: 'Bank 5' },
                        { value: '6', label: 'Bank 6' },
                        { value: '7', label: 'Bank 7' },
                        { value: '8', label: 'Bank 8' },
                        { value: '9', label: 'Bank 9' },
                    ]}
                />}
            />
        </>
    },
};

export const Full: Story = {
    args: {
        children: <>
            {WithHeader.args?.children}

            <Container fluid style={{ overflow: 'auto' }}>
                <Stack gap='xs' mah='100%'>
                    <Grid grow display='flex' mih={0}>
                        <Grid.Col span="auto" mah='100%'>
                            <UIStoragePanel
                                {...StoragePanelPrimary.args}
                            />
                        </Grid.Col>

                        <Grid.Col span="content" mah='100%' maw='fit-content'>
                            <Stack gap='xs' mah='100%' w='fit-content'>
                                <Card p='xs' style={{ flexShrink: 0 }}>
                                    <Button size='compact-sm'>
                                        <ThemeIcon variant='transparent' size='xs'> <SortHorizontal /></ThemeIcon>
                                    </Button>
                                </Card>

                                <UIStorageClipboard
                                    {...StorageClipboard.args}
                                />
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span="auto" mah='100%'>
                            <UIStoragePanel
                                {...StoragePanelPrimary.args}
                            />
                        </Grid.Col>
                    </Grid>
                    <Grid grow display='flex'>
                        <Grid.Col span="auto">
                            {/* <UIStoragePanel
                            {...StoragePanelPrimary.args}
                        /> */}
                            <Box>Foobar</Box>
                        </Grid.Col>
                    </Grid>
                </Stack>
            </Container>
        </>
    },
};
