import type React from "react";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { Route } from "../routes/storage";
import { SaveItem } from "../saves/save-item/save-item";
import { useTranslate } from '../translate/i18n';
import { ButtonLink } from '../ui/button/button';
import { Container } from '../ui/container/container';
import { TitledContainer } from '../ui/container/titled-container';
import { Icon } from '../ui/icon/icon';
import { theme } from '../ui/theme';
import { getSaveOrder } from './util/get-save-order';

export const StorageSaveSelect: React.FC = () => {
  const { t } = useTranslate();

  const saves = Route.useSearch({ select: (search) => search.saves }) ?? {};
  const navigate = Route.useNavigate();

  const saveInfosQuery = useSaveInfosGetAll();

  if (!saveInfosQuery.data) {
    return null;
  }

  const saveInfos = Object.values(saveInfosQuery.data.data)
    .filter(saveInfos => !saves[ saveInfos.id ])
    .sort((a, b) => a.lastWriteTime > b.lastWriteTime ? -1 : 1);

  return (
    <TitledContainer
      title={t('storage.save-select')}
      style={{
        width: '100%'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '50% 50%',
          gap: 8,
          paddingRight: 8,
        }}
      >
        {saveInfos.map((save, i) => (
          <SaveItem
            key={i}
            saveId={save.id}
            width='auto'
            onClick={() => {
              navigate({
                search: ({ saves }) => ({
                  saves: {
                    ...saves,
                    [ save.id ]: {
                      saveId: save.id,
                      saveBoxId: 0,
                      order: getSaveOrder(saves, save.id),
                    }
                  },
                }),
              });
            }}
          />
        ))}

        <Container style={{
          alignSelf: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          backgroundColor: theme.bg.panel,
          padding: '8px 16px',
        }}>
          <Icon name='info-circle' solid forButton />
          {t('saves.not-see')}
          <ButtonLink to={'/settings'}>
            {t('action.check-settings')}
          </ButtonLink>
        </Container>
      </div>
    </TitledContainer>
  );
};
