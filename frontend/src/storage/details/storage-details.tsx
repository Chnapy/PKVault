import React from "react";
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { Route } from '../../routes/storage';
import { UIStorageDetails } from '../../ui/storage/storage-details/ui-storage-details';
import { useCurrentStorage } from '../panel/storage-panel-context';
import { DetailsActions } from './details-actions';
import { DetailsContent } from './details-content';
import { DetailsMain } from './details-main';
import { DetailsSaves } from './details-saves';
import { useStorageSelectExpanded } from './hooks/use-storage-select-expanded';

export const StorageDetails: React.FC = withErrorCatcher('default', () => {
  const navigate = Route.useNavigate();

  const { expanded, toggleExpanded } = useStorageSelectExpanded();

  const { getSelected } = useCurrentStorage();
  const selectedSaveId = Route.useSearch({ select: search => getSelected(search.selected)?.saveId });
  const selectedId = Route.useSearch({ select: search => getSelected(search.selected)?.id }) ?? '';

  const pkmIndexQuery = usePkmIndex(selectedSaveId ?? null, data => !!data.data.byId[ selectedId ]);
  const noPkmsFound = !!selectedId && pkmIndexQuery.data === false;

  const unselect = React.useCallback(() => navigate({
    search: {
      selected: undefined,
    },
  }), [ navigate ]);

  // unselect if pkm does not exist
  React.useEffect(() => {
    if (noPkmsFound) {
      unselect();
    }
  }, [ unselect, noPkmsFound ]);

  return <UIStorageDetails
    expanded={expanded}
    header={actions => <DetailsSaves actions={actions} />}
    main={<DetailsMain />}
    content={<DetailsContent />}
    actions={!!selectedId && <DetailsActions
      focusOnMount
      pkmIds={[ selectedId ]}
      saveId={selectedSaveId ?? null}
    />}
    onExpand={toggleExpanded}
    onClose={unselect}
  />;
});
