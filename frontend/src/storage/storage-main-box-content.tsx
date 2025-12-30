import { css } from '@emotion/css';
import { Popover, PopoverButton } from '@headlessui/react';
import React from "react";
import { BoxType, type PkmDTO } from "../data/sdk/model";
import {
  useStorageCreateMainBox,
  useStorageDeleteMainBox,
  useStorageGetMainBoxes,
  useStorageGetMainPkms
} from "../data/sdk/storage/storage.gen";
import { withErrorCatcher } from '../error/with-error-catcher';
import { Route } from "../routes/storage";
import { useTranslate } from '../translate/i18n';
import { Icon } from '../ui/icon/icon';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageBoxMainActions } from '../ui/storage-box/storage-box-main-actions';
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { StorageMoveContext } from './actions/storage-move-context';
import { SortAdvancedAction } from './advanced-actions/sort-advanced-action';
import { BankContext } from './bank/bank-context';
import { StorageBoxEdit } from './box/storage-box-edit';
import { StorageBoxList } from './box/storage-box-list';
import { StorageHeader } from './box/storage-header';
import { StorageMainItem } from './storage-main-item';

export const StorageMainBoxContent: React.FC<{
  boxId: number;
  style?: React.CSSProperties;
}> = withErrorCatcher('default', ({ boxId, style }) => {
  const [ showBoxes, setShowBoxes ] = React.useState(false);

  const { t } = useTranslate();
  const navigate = Route.useNavigate();

  const selectedBankBoxes = BankContext.useSelectedBankBoxes();
  const mainBoxIds = Route.useSearch({ select: search => search.mainBoxIds }) ?? [];

  const boxIndex = mainBoxIds.indexOf(boxId);

  const getMainBoxIds = (value: number) => mainBoxIds.map((id, i) => i === boxIndex ? value : id);

  const moveContext = StorageMoveContext.useValue();

  const boxesQuery = useStorageGetMainBoxes();
  const pkmsQuery = useStorageGetMainPkms();

  const loading = [ pkmsQuery, selectedBankBoxes ].some(query => query.isLoading);

  const boxCreateMutation = useStorageCreateMainBox();
  const boxDeleteMutation = useStorageDeleteMainBox();

  const boxes = boxesQuery.data?.data
    .filter(box => box.bankId === selectedBankBoxes.data?.selectedBank.id) ?? [];
  const sortedBoxes = boxes.sort((b1, b2) => b1.order < b2.order ? -1 : 1);
  const filteredBoxes = sortedBoxes
    .filter(box => !mainBoxIds.includes(box.idInt) || box.idInt === boxId);
  const pkms = pkmsQuery.data?.data ?? [];

  const selectedBoxIndex = filteredBoxes.findIndex((box) => box.idInt === boxId);
  const selectedBox = filteredBoxes[ selectedBoxIndex ] ?? {
    id: '-99',
    idInt: -99,
    name: '',
    type: BoxType.Box,
    slotCount: 30,
    canReceivePkm: false,
  };

  const previousBox = filteredBoxes[ selectedBoxIndex - 1 ] ?? filteredBoxes[ filteredBoxes.length - 1 ];
  const nextBox = filteredBoxes[ selectedBoxIndex + 1 ] ?? filteredBoxes[ 0 ];

  const boxPkmsList = pkms.filter((pkm) => pkm.boxId === selectedBox.idInt);

  const boxPkms = Object.fromEntries(
    boxPkmsList.map((pkm) => [ pkm.boxSlot, pkm ])
  );

  const allItems = new Array(selectedBox.slotCount)
    .fill(null)
    .map((_, i): PkmDTO | null => boxPkms[ i ] ?? null);

  return (
    <Popover
      className={css({
        position: 'relative',
      })}
    >
      <PopoverButton
        as={StorageBox}
        loading={loading}
        slotCount={selectedBox.slotCount}
        style={style}
        header={
          <>
            <StorageHeader
              gameLogo={<div
                style={{
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <img
                  src="/logo.svg"
                  style={{
                    display: 'block',
                    height: 24,
                    width: 24,
                  }}
                />
              </div>}
              boxId={boxId}
              boxType={selectedBox.type}
              boxName={selectedBox.name}
              boxPkmCount={boxPkmsList.length}
              boxSlotCount={selectedBox.slotCount}
              totalPkmCount={pkms.length}
              showBoxes={showBoxes}
              advancedActions={[
                {
                  label: t('storage.box.advanced.sort'),
                  icon: <Icon name='sort' solid forButton />,
                  panelContent: close => <SortAdvancedAction.Main selectedBoxId={selectedBox.idInt} close={close} />,
                },
                {
                  label: 'Import pkm files',
                  icon: <Icon name='file-import' solid forButton />,
                  panelContent: () => <div>Feature not ready yet</div>,
                },
              ]}
              onBoxesDisplay={() => setShowBoxes(value => !value)}
              onPreviousBoxClick={!previousBox || previousBox.id === selectedBox.id
                ? undefined
                : () => navigate({
                  search: {
                    mainBoxIds: getMainBoxIds(previousBox.idInt),
                  },
                })}
              onNextBoxClick={!nextBox || nextBox.id === selectedBox.id
                ? undefined
                : () => navigate({
                  search: {
                    mainBoxIds: getMainBoxIds(nextBox.idInt),
                  },
                })}
              onSplitClick={mainBoxIds.length < 2 && nextBox && nextBox.id !== selectedBox.id
                ? () => navigate({
                  search: () => ({
                    mainBoxIds: [ boxId, nextBox.idInt ]
                  })
                })
                : undefined}
              onClose={mainBoxIds.length > 1
                ? () => navigate({
                  search: () => ({
                    mainBoxIds: mainBoxIds.filter(id => id !== boxId),
                  })
                })
                : undefined
              }
            />

            {showBoxes && <StorageBoxList
              selectedBoxes={mainBoxIds}
              boxes={boxes}
              pkms={pkms.map(pkm => ({
                id: pkm.id,
                boxId: pkm.boxId,
                boxSlot: pkm.boxSlot,
              }))}
              onBoxChange={value => {
                if (!mainBoxIds.includes(value)) {
                  navigate({
                    search: {
                      mainBoxIds: getMainBoxIds(Number(value)),
                    },
                  });
                }
                setShowBoxes(false);
              }}
              editPanelContent={(boxId, close) => <StorageBoxEdit boxId={boxId} close={close} />}
              deleteFn={boxId => boxDeleteMutation.mutateAsync({ boxId })}
              addFn={selectedBankBoxes.data && (() => boxCreateMutation.mutateAsync({
                params: {
                  bankId: selectedBankBoxes.data.selectedBank.id,
                }
              }))}
            />}
          </>
        }
      >
        {!showBoxes && <>
          {allItems.map((pkm, i) => {
            return <div
              key={i}
              style={{ order: i, display: 'flex' }}
            >
              {!pkm
                || (moveContext.selected
                  && !moveContext.selected.saveId
                  && !moveContext.selected.target
                  && moveContext.selected.ids.includes(pkm.id)
                )
                ? <StorageItemPlaceholder
                  boxId={selectedBox.idInt}
                  boxSlot={i}
                  pkmId={pkm?.id}
                />
                : <StorageMainItem pkmId={pkm.id} />}
            </div>;
          })}

          {moveContext.selected && !moveContext.selected.saveId && !moveContext.selected.target && (
            moveContext.selected.ids.map(id => <StorageMainItem key={id} pkmId={id} />)
          )}
        </>}
      </PopoverButton>

      <StorageBoxMainActions boxId={selectedBox.idInt} anchor={'right start'} />
    </Popover>
  );
});
