import { Box, Button, Card, Container, Grid, Stack, ThemeIcon } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeftRightIcon } from 'lucide-react';
import { UIBankList } from '../bank/ui-bank-list';
import { UIStorageClipboard } from '../storage-clipboard/ui-storage-clipboard';
import { Primary as StorageClipboard } from '../storage-clipboard/ui-storage-clipboard.stories';
import { UIStoragePanelWrapperDetails } from '../storage-panel/ui-storage-panel-wrapper-details';
import { Primary as StoragePanelWrapperDetailsStory } from '../storage-panel/ui-storage-panel-wrapper-details.stories';
import { UIHeader } from './header/ui-header';
import { UIHeaderItem } from './header/ui-header-item';
import { UIFrame } from './ui-frame';

const meta = {
    title: 'UI/UIFrame',
    component: UIFrame,
} satisfies Meta<typeof UIFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

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
                <Stack mah='100%'>
                    <Grid grow display='flex' mih={0}>
                        <Grid.Col span="auto" mah='100%'>
                            <UIStoragePanelWrapperDetails
                                {...StoragePanelWrapperDetailsStory.args}
                            />
                        </Grid.Col>

                        <Grid.Col span="content" mah='100%' maw='fit-content'>
                            <Stack mah='100%' w='fit-content'>
                                <Card p='sm' style={{ flexShrink: 0 }}>
                                    <Button size='compact-sm'>
                                        <ThemeIcon variant='transparent' size='xs'> <ArrowLeftRightIcon /></ThemeIcon>
                                    </Button>
                                </Card>

                                <UIStorageClipboard
                                    {...StorageClipboard.args}
                                />
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span="auto" mah='100%'>
                            <UIStoragePanelWrapperDetails
                                {...StoragePanelWrapperDetailsStory.args}
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
