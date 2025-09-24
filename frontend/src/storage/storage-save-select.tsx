import type React from "react";
import { useSaveInfosGetAll } from '../data/sdk/save-infos/save-infos.gen';
import { Route } from "../routes/storage";
import { SaveItem } from "../saves/save-item/save-item";
import { TitledContainer } from '../ui/container/titled-container';
import { ButtonLink } from '../ui/button/button';
import { Container } from '../ui/container/container';
import { Icon } from '../ui/icon/icon';
import { theme } from '../ui/theme';

export const StorageSaveSelect: React.FC = () => {
  const saveInfosQuery = useSaveInfosGetAll();

  const navigate = Route.useNavigate();

  if (!saveInfosQuery.data) {
    return null;
  }

  const saveInfos = Object.values(saveInfosQuery.data.data).sort((a, b) => {
    return a.lastWriteTime > b.lastWriteTime ? -1 : 1;
  });

  return (
    <TitledContainer
      title={'Save selection'}
      maxHeight={536}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {saveInfos.map((save, i) => (
          <SaveItem
            key={i}
            saveId={save.id}
            onClick={() => {
              navigate({
                search: {
                  save: save.id,
                },
              });
            }}
          />
        ))}

        <Container style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          backgroundColor: theme.bg.panel,
          padding: '8px 16px',
        }}>
          <Icon name='info-circle' solid forButton />
          Not seeing your save ?
          <ButtonLink to={'/settings'}>Check settings</ButtonLink>
        </Container>
      </div>
    </TitledContainer>
  );
};
