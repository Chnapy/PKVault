import { Badge, Button, Card, Divider, EmptyState, Group, Tooltip } from '@mantine/core';
import { DownloadIcon, FolderIcon, FolderSearchIcon, PackageOpenIcon } from 'lucide-react';
import type React from "react";
import { HistoryContext } from '../context/history-context';
import { getApiFullUrl } from '../data/mutator/custom-instance';
import { getSaveInfosDownloadUrl, useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { withErrorCatcher } from '../error/with-error-catcher';
import { useStaticData } from '../hooks/use-static-data';
import { getGameInfos } from '../pokedex/details/util/get-game-infos';
import { Route } from '../routes/saves';
import { SavesUploadButton } from '../saves/saves-upload-popover/saves-upload-button';
import { useDesktopMessage } from '../settings/globs-input/hooks/use-desktop-message';
import { GameExpanded } from '../storage/panel/game-list/game-expanded';
import { useTranslate } from '../translate/i18n';
import { UIButton } from '../ui/form/button/ui-button';
import { UISavesContent } from '../ui/saves/ui-saves-content';
import { filterIsDefined } from '../util/filter-is-defined';

export const SavesPage: React.FC = withErrorCatcher('default', () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];

  const desktopMessage = useDesktopMessage();

  const staticData = useStaticData();
  const saveInfosQuery = useSaveInfosGetAll();

  const isLoading = saveInfosQuery.isPending && saveInfosQuery.isEnabled;

  const generations = [ ...new Set(Object.values(staticData.versions).map(version => version.generation)) ].sort();

  const saveInfos = Object.values(saveInfosQuery.data?.data ?? {})
    .filter(filterIsDefined)
    .sort((a, b) => {
      return a.lastWriteTime > b.lastWriteTime ? -1 : 1;
    });

  return <UISavesContent>
    <Card pr={0} style={{ overflowY: 'scroll' }}>
      {!isLoading && saveInfos.length === 0 && <EmptyState
        size='sm'
        py='md'
        icon={<PackageOpenIcon />}
        title={t('settings.form.saves.empty')}
      />}

      {generations.map(generation => {
        const saves = saveInfos
          .filter(save => save.generation === generation)
          .sort((s1, s2) => s1.displayedVersion - s2.displayedVersion);
        if (saves.length === 0) {
          return null;
        }

        const maxSpecies = Math.max(...saves.map(save => staticData.versions[ save.version ]?.maxSpeciesId ?? 0));

        const regions = staticData.generations[ generation ]?.regions ?? [];

        return [
          <Card.Section key={generation} inheritPadding withBorder>
            <Group py='sm'>
              <span>
                {t('saves.title', { generation })}
              </span>
              {regions.map(region => <Badge key={region} variant='default'>{region}</Badge>)}
              <Divider orientation='vertical' />
              <span>
                {t('saves.title.species', { maxSpecies })}
              </span>
            </Group>
          </Card.Section>,
          <Card.Section key={generation * 100} inheritPadding withBorder py='inherit'>
            <Group>
              {saves.map(save => <GameExpanded
                key={save.id}
                id={save.id.toString()}
                imgSrc={getGameInfos(save.displayedVersion).img}
                label={staticData.versions[ save.displayedVersion ]?.name}
                onSelect={() => navigate({
                  to: '/storage',
                  search: {
                    storages: [
                      storageHistoryValue?.search.storages?.[ 0 ] ?? { saveId: null },
                      {
                        saveId: save.id,
                      }
                    ],
                  },
                })}
                actions={<>
                  {desktopMessage
                    ? <Tooltip label={t('saves.action.open')}>
                      <Button
                        variant='default'
                        size='compact-xs'
                        fullWidth
                        onClick={() => desktopMessage.openFile({
                          type: 'open-folder',
                          isDirectory: false,
                          path: save.path
                        })}
                      >
                        <FolderIcon />
                      </Button>
                    </Tooltip>
                    : <Tooltip label={t('saves.action.download')}>
                      <Button
                        variant='default'
                        size='compact-xs'
                        fullWidth
                        component='a'
                        target='__blank'
                        type='button'
                        href={getApiFullUrl(getSaveInfosDownloadUrl(save.id))}
                      >
                        <DownloadIcon />
                      </Button>
                    </Tooltip>}
                </>}
              />)}
            </Group>
          </Card.Section>,
        ];
      })}

      <Card.Section inheritPadding withBorder py='inherit'>
        <Group justify='center' wrap='nowrap'>
          <UIButton
            name='add-game-path'
            controlLabel={t('saves.action.add-path')}
            onClick={() => navigate({
              to: '/settings'
            })}
            // size='xl'
            leftSection={<FolderSearchIcon />}
            variant='filled'
            color='blue'
          >
            {t('saves.action.add-path')}
          </UIButton>

          <SavesUploadButton disabledLabel={t('action.not-possible')} />
        </Group>
      </Card.Section>
    </Card>
  </UISavesContent>;
});
