import { css } from '@emotion/css';
import { Popover, PopoverButton } from '@headlessui/react';
import React from "react";
import { BoxType, type PkmDTO } from "../data/sdk/model";
import {
  useStorageDeleteMainBox,
  useStorageGetMainBoxes,
  useStorageGetMainPkms
} from "../data/sdk/storage/storage.gen";
import { withErrorCatcher } from '../error/with-error-catcher';
import { Route } from "../routes/storage";
import { useTranslate } from '../translate/i18n';
import { ButtonWithConfirm } from '../ui/button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../ui/button/button-with-disabled-popover';
import { ButtonWithPopover } from '../ui/button/button-with-popover';
import { Icon } from '../ui/icon/icon';
import { type DataOption } from '../ui/input/select-input';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageBoxMainActions } from '../ui/storage-box/storage-box-main-actions';
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { StorageMoveContext } from './actions/storage-move-context';
import { StorageBoxCreate } from './box/storage-box-create';
import { StorageBoxEdit } from './box/storage-box-edit';
import { StorageHeader } from './box/storage-header';
import { StorageMainItem } from './storage-main-item';

export const StorageMainBoxContent: React.FC<{
  boxId: number;
  style?: React.CSSProperties;
}> = withErrorCatcher('default', ({ boxId, style }) => {
  const { t } = useTranslate();

  const mainBoxIds = Route.useSearch({ select: (search) => search.mainBoxIds }) ?? [ 0 ];
  const navigate = Route.useNavigate();

  const boxIndex = mainBoxIds.indexOf(boxId);

  const getMainBoxIds = (value: number) => mainBoxIds.map((id, i) => i === boxIndex ? value : id);

  const moveContext = StorageMoveContext.useValue();

  const boxesQuery = useStorageGetMainBoxes();
  const pkmsQuery = useStorageGetMainPkms();

  const loading = [ boxesQuery, pkmsQuery ].some(query => query.isLoading);

  const boxDeleteMutation = useStorageDeleteMainBox();

  const boxes = boxesQuery.data?.data ?? [];
  const pkms = pkmsQuery.data?.data ?? [];

  const filteredBoxes = boxes.filter(box => !mainBoxIds.includes(box.idInt) || box.idInt === boxId);

  const selectedBoxIndex = filteredBoxes.findIndex((box) => box.idInt === boxId);
  const selectedBox = filteredBoxes[ selectedBoxIndex ] ?? {
    id: '-99',
    idInt: -99,
    name: '',
    type: BoxType.Default,
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
        style={style}
        header={
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
            boxPkmCount={boxPkmsList.length}
            boxSlotCount={selectedBox.slotCount}
            totalPkmCount={pkms.length}
            boxesOptions={boxes.map((box): DataOption<string> => ({
              value: box.id,
              option: <div style={{ margin: '2px 4px' }}>
                {box.name}
              </div>,
              disabled: mainBoxIds.includes(box.idInt),
            }))}
            onBoxChange={value => navigate({
              search: {
                mainBoxIds: getMainBoxIds(Number(value)),
              },
            })}
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
          >
            <ButtonWithPopover
              panelContent={close => <StorageBoxEdit boxId={selectedBox.id} close={close} />}
            >
              <Icon name='pen' forButton />
            </ButtonWithPopover>

            <ButtonWithPopover
              panelContent={close => <StorageBoxCreate close={close} />}
            >
              <Icon name='plus' forButton />
            </ButtonWithPopover>

            <ButtonWithDisabledPopover
              as={ButtonWithConfirm}
              onClick={() => boxDeleteMutation.mutateAsync({ boxId: selectedBox.id })}
              disabled={boxes.length <= 1 || boxPkmsList.length > 0}
              showHelp={boxPkmsList.length > 0}
              helpTitle={t('storage.box.delete.help')}
            >
              <Icon name='trash' solid forButton />
            </ButtonWithDisabledPopover>
          </StorageHeader>
        }
      >
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
      </PopoverButton>

      <StorageBoxMainActions boxId={selectedBox.idInt} anchor={'right start'} />
    </Popover>
  );
});
