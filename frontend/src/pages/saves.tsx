import { Badge, Button, Card, Divider, Group } from '@mantine/core';
import { DownloadIcon, FolderIcon } from 'lucide-react';
import type React from "react";
import { HistoryContext } from '../context/history-context';
import { getApiFullUrl } from '../data/mutator/custom-instance';
import { getSaveInfosDownloadUrl, useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { withErrorCatcher } from '../error/with-error-catcher';
import { useStaticData } from '../hooks/use-static-data';
import { getGameInfos } from '../pokedex/details/util/get-game-infos';
import { Route } from '../routes/saves';
import { useDesktopMessage } from '../settings/globs-input/hooks/use-desktop-message';
import { GameExpanded } from '../storage/panel/game-list/game-expanded';
import { useTranslate } from '../translate/i18n';
import { UISavesContent } from '../ui-new/saves/ui-saves-content';
import { filterIsDefined } from '../util/filter-is-defined';

export const SavesPage: React.FC = withErrorCatcher('default', () => {
  const { t } = useTranslate();

  const navigate = Route.useNavigate();

  const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];

  const desktopMessage = useDesktopMessage();

  const staticData = useStaticData();
  const saveInfosQuery = useSaveInfosGetAll();

  if (!saveInfosQuery.data) {
    return null;
  }

  const generations = [ ...new Set(Object.values(staticData.versions).map(version => version.generation)) ].sort();

  const saveInfos = Object.values(saveInfosQuery.data.data)
    .filter(filterIsDefined)
    .sort((a, b) => {
      return a.lastWriteTime > b.lastWriteTime ? -1 : 1;
    });

  return <UISavesContent>
    <Card style={{ overflow: 'auto' }}>
      {generations.map(generation => {
        const saves = saveInfos.filter(save => save.generation === generation);
        if (saves.length === 0) {
          return null;
        }

        const maxSpecies = Math.max(...saves.map(save => staticData.versions[ save.version ]?.maxSpeciesId ?? 0));

        const regions = staticData.generations[ generation ]?.regions ?? [];

        return [
          <Card.Section key={generation} inheritPadding withBorder>
            <Group py='sm'>
              <span>
                Generation {generation}
              </span>
              {regions.map(region => <Badge key={region} variant='default'>{region}</Badge>)}
              <Divider orientation='vertical' />
              <span>
                {maxSpecies} species
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
                    ? <Button
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
                    : <Button
                      variant='default'
                      size='compact-xs'
                      fullWidth
                      component='a'
                      target='__blank'
                      type='button'
                      href={getApiFullUrl(getSaveInfosDownloadUrl(save.id))}
                    >
                      <DownloadIcon />
                    </Button>}
                </>}
              />)}
            </Group>
          </Card.Section>,
        ];
      })}
    </Card>
  </UISavesContent>;

  //     <Container className={css({
  //       display: 'flex',
  //       alignItems: 'center',
  //       gap: 4,
  //       backgroundColor: theme.bg.panel,
  //       padding: '8px 16px',
  //     })}>
  //       <Icon name='info-circle' solid forButton />
  //       {t('saves.not-see')}

  //       <ButtonLink to={'/settings'}>
  //         {t('action.check-settings')}
  //       </ButtonLink>

  //       <ButtonLink
  //         to={'.'}
  //         search={{ help: '1-quick-start.md' satisfies DocsGenEnSlugs }}
  //       >
  //         <Icon name='info-circle' solid />
  //         {t('action.quick-start')}
  //       </ButtonLink>
  //     </Container>
  //   </div>
  // );
});
