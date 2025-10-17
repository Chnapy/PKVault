import { css } from '@emotion/css';
import { Popover, PopoverButton } from '@headlessui/react';
import React from "react";
import type { PkmDTO } from "../data/sdk/model";
import {
  useStorageDeleteMainBox,
  useStorageGetMainBoxes,
  useStorageGetMainPkms
} from "../data/sdk/storage/storage.gen";
import { Route } from "../routes/storage";
import { useTranslate } from '../translate/i18n';
import { Button } from "../ui/button/button";
import { ButtonWithConfirm } from '../ui/button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../ui/button/button-with-disabled-popover';
import { ButtonWithPopover } from '../ui/button/button-with-popover';
import { Icon } from '../ui/icon/icon';
import { SelectStringInput, type DataOption } from '../ui/input/select-input';
import { StorageBox } from "../ui/storage-box/storage-box";
import { StorageBoxMainActions } from '../ui/storage-box/storage-box-main-actions';
import { StorageItemPlaceholder } from "../ui/storage-item/storage-item-placeholder";
import { theme } from '../ui/theme';
import { StorageMoveContext } from './actions/storage-move-context';
import { StorageBoxCreate } from './box/storage-box-create';
import { StorageBoxEdit } from './box/storage-box-edit';
import { StorageMainItem } from './storage-main-item';
import { StorageSelectAll } from './storage-select-all';

export const StorageMainBox: React.FC = () => {
  const { t } = useTranslate();

  const mainBoxId = Route.useSearch({ select: (search) => search.mainBoxId });
  const navigate = Route.useNavigate();

  const moveContext = StorageMoveContext.useValue();
  const isMoveDragging = !!moveContext.selected && !moveContext.selected.target;

  const boxesQuery = useStorageGetMainBoxes();
  const pkmsQuery = useStorageGetMainPkms();

  const boxDeleteMutation = useStorageDeleteMainBox();

  const boxes = boxesQuery.data?.data ?? [];
  const pkms = pkmsQuery.data?.data ?? [];

  // const [boxId, setBoxId] = React.useState<number>();

  const selectedBoxIndex =
    typeof mainBoxId === "number"
      ? boxes.findIndex((box) => box.idInt === mainBoxId)
      : 0;
  const selectedBox = boxes[ selectedBoxIndex ];

  if (!selectedBox) {
    return null;
  }

  const previousBox = boxes[ selectedBoxIndex - 1 ] ?? boxes[ boxes.length - 1 ];
  const nextBox = boxes[ selectedBoxIndex + 1 ] ?? boxes[ 0 ];

  const boxesOptions = boxes.map((box): DataOption<string> => ({
    value: box.id,
    option: <div style={{ margin: '2px 4px' }}>
      {box.name}
    </div>,
    disabled: selectedBox.id === box.id,
  }));

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
        header={
          <>
            <div
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
            </div>

            <div
              style={{
                flex: 1,
                flexGrow: 2,
                display: 'flex',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Button
                triggerOnHover={isMoveDragging}
                onClick={() =>
                  navigate({
                    search: {
                      mainBoxId: previousBox.idInt,
                    },
                  })
                }
                disabled={previousBox.id === selectedBox.id}
              >
                <Icon name='angle-left' forButton />
              </Button>

              <SelectStringInput
                triggerOnHover={isMoveDragging}
                data={boxesOptions}
                value={selectedBox.id}
                onChange={value => navigate({
                  search: {
                    mainBoxId: Number(value),
                  },
                })}
              />

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

              <Button
                triggerOnHover={isMoveDragging}
                onClick={() =>
                  navigate({
                    search: {
                      mainBoxId: nextBox.idInt,
                    },
                  })
                }
                disabled={nextBox.id === selectedBox.id}
              >
                <Icon name='angle-right' forButton />
              </Button>
            </div>

            <div
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8
              }}
            >
              <StorageSelectAll boxId={selectedBox.idInt} />

              <div style={{ display: 'flex', gap: 2 }}>
                <Icon name='folder' solid forButton />
                <span style={{ color: theme.text.primary }}>{boxPkmsList.length}</span>
                /{selectedBox.slotCount} - {t('total')}.<span style={{ color: theme.text.primary }}>{pkms.length}</span>
              </div>
            </div>
          </>
        }
      >
        {allItems.map((pkm, i) => {
          if (!pkm
            || (moveContext.selected
              && !moveContext.selected.saveId
              && !moveContext.selected.target
              && moveContext.selected.ids.includes(pkm.id)
            )
          ) {
            return (
              <StorageItemPlaceholder
                key={i}
                boxId={selectedBox.idInt}
                boxSlot={i}
                pkmId={pkm?.id}
              />
            );
          }

          return <StorageMainItem key={i} pkmId={pkm.id} />;
        })}

        {moveContext.selected && !moveContext.selected.saveId && !moveContext.selected.target && (
          moveContext.selected.ids.map(id => <StorageMainItem key={id} pkmId={id} />)
        )}
      </PopoverButton>

      <StorageBoxMainActions boxId={selectedBox.idInt} anchor={'right start'} />
    </Popover>
  );
};
