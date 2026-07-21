import { Button, Card, Center, Group, SimpleGrid, Tabs } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileArchiveIcon, FileIcon, FolderArchiveIcon, FolderIcon, FolderTreeIcon, GlobeIcon, PenOffIcon, RefreshCcwIcon, SaveIcon, ShieldOff } from 'lucide-react';
import { DataActionType } from '../../../data/sdk/model';
import { UIActionsPanel } from '../../actions-panel/ui-actions-panel';
import { UIGlobsInputItem } from '../../form/globs-input/ui-globs-input-item';
import { UIGlobsInputList } from '../../form/globs-input/ui-globs-input-list';
import { UIGlobsInputResults } from '../../form/globs-input/ui-globs-input-results';
import { UISelect } from '../../form/select/ui-select';
import { UISwitch } from '../../form/switch/ui-switch';
import { UITextInput } from '../../form/text-input/ui-text-input';
import { UIInputLabel } from '../../form/ui-input-label';
import { UIBallIcon } from '../../icon/ui-ball-icon';
import { UIAppLayout } from '../../layout/app-layout/ui-app-layout';
import { UIFooter } from '../../layout/footer/ui-footer';
import { UIHeader } from '../../layout/header/ui-header';
import { WithSettingsCategories as UIHeaderSettingsStory } from '../../layout/header/ui-header.stories';
import { UIBackupItem } from '../../settings/backups/ui-backup-item';
import { UIBackupList } from '../../settings/backups/ui-backup-list';
import { UIBackupsTabList } from '../../settings/backups/ui-backups-tab-list';
import { UISettingsContent } from '../../settings/ui-settings-content';

const meta = {
    title: 'Pages/Settings',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const generatePaths = (base: string, length: number) => new Array(length).fill(0).map((_, i) => `${base}-${i}.sav`);

export const Primary: Story = {
    render: () => <UIAppLayout
        header={<UIHeader
            {...UIHeaderSettingsStory.args}
        />}
        bottom={<UIActionsPanel
            data={[
                {
                    type: DataActionType.DATA_NORMALIZE,
                    description: 'Description',
                    label: null,
                    index: 0,
                },
                {
                    type: DataActionType.MOVE_PKM,
                    description: 'Description',
                    label: null,
                    index: 1,
                },
                {
                    type: DataActionType.MAIN_CREATE_BOX,
                    description: 'Description',
                    label: null,
                    index: 2,
                },
                {
                    type: DataActionType.EVOLVE_PKM,
                    description: 'Description',
                    label: null,
                    index: 3,
                },
                {
                    type: DataActionType.MAIN_DELETE_BANK,
                    description: 'Description',
                    label: null,
                    index: 4,
                },
            ]}
            onDelete={index => Promise.resolve(console.log(index))}
            onSave={() => Promise.resolve(console.log('save'))}
        />}
        footer={<UIFooter />}
        children={<UISettingsContent
            left={<>
                <Card>
                    <SimpleGrid cols={2}>
                        <UIInputLabel leftSection={<UIBallIcon />} label='PKVault' />
                        <div>v2.0.0 - SteamDeck - Flatpak</div>
                        <UIInputLabel leftSection={<img src="https://projectpokemon.org/favicon.ico" />} label='PKHeX' />
                        <div>26.02.26</div>
                        <UIInputLabel leftSection={<FolderIcon />} label='PKVault path' />
                        <div>/pkvault</div>
                        <UIInputLabel leftSection={<FileIcon />} label='Config path' />
                        <div>/pkvault/config/pkvault.json</div>
                    </SimpleGrid>
                </Card>

                <Card>
                    <SimpleGrid cols={2}>
                        <UIInputLabel leftSection={<GlobeIcon />} forInput='language' label='Language' />
                        <UISelect
                            name='language'
                            controlLabel='Change language'
                            data={[
                                'English', 'Français', 'Deutsch'
                            ]}
                        />
                    </SimpleGrid>
                </Card>

                <Card>
                    <SimpleGrid cols={2}>
                        <UIInputLabel leftSection={<PenOffIcon />} forInput='hide-cheats' label='Hide cheats' />
                        <UISwitch
                            name='hide-cheats'
                            controlLabel='Hide cheats'
                            ml='auto'
                        />

                        <UIInputLabel leftSection={<ShieldOff />} forInput='skip-legality' label='Skip legality checks' />
                        <UISwitch
                            name='skip-legality'
                            controlLabel='Skip legality checks'
                            ml='auto'
                        />
                    </SimpleGrid>
                </Card>
            </>}
            right={<>
                <Card>
                    <UIGlobsInputList
                        labelList='Saves files locations'
                        labelAddFile='Add a save'
                        labelAddFolder='Add a save directory'
                        onAdd={async (...params) => console.log(...params)}
                        isDesktop//={false}
                        results={<UIGlobsInputResults
                            name='results'
                            data={generatePaths('c:/abc/def/', 100)}
                            showFiles
                        />}
                    >
                        <UIGlobsInputItem
                            name='1'
                            value={'./**/*.sav'}
                            onEdit={console.log}
                            onRemove={console.log}
                            // disabled={disabled}
                            results={generatePaths('c:/abc/zoo/', 100)}
                            isDesktop//={false}
                        />
                        <UIGlobsInputItem
                            name='2'
                            value={'./foo/bar.bin'}
                            onEdit={console.log}
                            onRemove={console.log}
                            // disabled={disabled}
                            results={generatePaths('c:/abc/foo/', 100)}
                            isDesktop//={false}
                        />
                        <UIGlobsInputItem
                            name='3'
                            value={'!./**/*.bin'}
                            onEdit={console.log}
                            onRemove={console.log}
                            // disabled={disabled}
                            results={generatePaths('c:/abc/foo/', 100)}
                            isDesktop//={false}
                        />
                    </UIGlobsInputList>
                </Card>
            </>}
            bottom={<Center>
                <Card>
                    <Group wrap='nowrap'>
                        <Button
                            size='compact-md'
                        >
                            Cancel
                        </Button>

                        <Button
                            variant='filled'
                            color='primary'
                            size='compact-md'
                            pl='md'
                            pr='lg'
                            // disabled={}
                            leftSection={<SaveIcon />}
                        >
                            Save
                        </Button>
                    </Group>
                </Card>
            </Center>}
        />}
    />,
};

export const Backups: Story = {
    render: () => <UIAppLayout
        header={<UIHeader
            {...UIHeaderSettingsStory.args}
        />}
        bottom={<UIActionsPanel
            data={[
                {
                    type: DataActionType.DATA_NORMALIZE,
                    description: 'Description',
                    label: null,
                    index: 0,
                },
                {
                    type: DataActionType.MOVE_PKM,
                    description: 'Description',
                    label: null,
                    index: 1,
                },
                {
                    type: DataActionType.MAIN_CREATE_BOX,
                    description: 'Description',
                    label: null,
                    index: 2,
                },
                {
                    type: DataActionType.EVOLVE_PKM,
                    description: 'Description',
                    label: null,
                    index: 3,
                },
                {
                    type: DataActionType.MAIN_DELETE_BANK,
                    description: 'Description',
                    label: null,
                    index: 4,
                },
            ]}
            onDelete={index => Promise.resolve(console.log(index))}
            onSave={() => Promise.resolve(console.log('save'))}
        />}
        footer={<UIFooter />}
        children={<UISettingsContent
            left={<>
                <Card>
                    <SimpleGrid cols={2}>
                        <UIInputLabel leftSection={<FolderArchiveIcon />} label='Backups directory' />
                        <div>/pkvault/backups</div>

                        <UIInputLabel leftSection={<FolderTreeIcon />} label='Backup content' />
                        <div>All saves + all storage</div>

                        <UIInputLabel leftSection={<RefreshCcwIcon />} label='Auto-backup' />
                        <div>Before any file write (save)</div>

                        <UIInputLabel leftSection={<FileArchiveIcon />} label='Generic format' />
                        <div>Can be opened from outside PKVault (.zip)</div>
                    </SimpleGrid>
                </Card>
            </>}
            right={<UIBackupList
                header={<UIBackupsTabList
                    value='26/02/2026'
                    onSelect={console.log}
                    scopeId='storage-content'
                >
                    <Tabs.Tab value='26/02/2026' p='md'>
                        26/02/2026
                    </Tabs.Tab>
                    <Tabs.Tab value='25/02/2026' p='md'>
                        25/02/2026
                    </Tabs.Tab>
                </UIBackupsTabList>}
            >
                {new Array(15).fill(0).map((_, i) => <UIBackupItem
                    key={i}
                    order={i}
                    createdAt={`2026-05-25T14:35:${i < 10 ? 0 : ''}${i}.496+00:00`}
                    filename={`backup_before_save_bkp_2026-04-25T1259${i < 10 ? 0 : ''}${i}-832Z.zip`}
                    path={`C:/foo/bar/backups/backup_before_save_bkp_2026-04-25T1259${i < 10 ? 0 : ''}${i}-832Z.zip`}
                    onRestore={() => console.log('restore', i)}
                    onDelete={() => console.log('delete', i)}
                >
                    <UITextInput
                        name={`2026-05-25T14:35:${i < 10 ? 0 : ''}${i}.496+00:00-input`}
                        value={'backup_before_save'}
                        onChange={console.log}
                        // maw={200}
                        styles={{
                            input: {
                                height: 'auto',
                                minHeight: 0,
                                lineHeight: 'inherit',
                            },
                        }}
                        onSubmit={console.log}
                        onCancel={console.log}
                    />
                </UIBackupItem>)}
            </UIBackupList>}
            bottom={<Center>
                <Card>
                    <Group wrap='nowrap'>
                        <Button
                            size='compact-md'
                        >
                            Cancel
                        </Button>

                        <Button
                            variant='filled'
                            color='primary'
                            size='compact-md'
                            pl='md'
                            pr='lg'
                            // disabled={}
                            leftSection={<SaveIcon />}
                        >
                            Save
                        </Button>
                    </Group>
                </Card>
            </Center>}
        />}
    />,
};
