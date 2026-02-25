import { css } from '@emotion/css';
import type React from 'react';
import { usePkmVariantIndex } from '../../data/hooks/use-pkm-variant-index';
import { useStorageDeleteMainBank, useStorageGetBoxes, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Button, ButtonLink } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../../ui/button/button-with-disabled-popover';
import { ButtonWithPopover } from '../../ui/button/button-with-popover';
import { Icon } from '../../ui/icon/icon';
import { useMoveDroppableBank } from '../move/hooks/use-move-droppable-bank';
import { useMoveLoadingBank } from '../move/hooks/use-move-loading-bank';
import { BankContext } from './bank-context';
import { BankEdit } from './bank-edit';

export const BankItem: React.FC<{
  bankId: string;
}> = ({ bankId }) => {
  const { t } = useTranslate();
  const selectedBankBoxes = BankContext.useSelectedBankBoxes();
  const selectBankProps = BankContext.useSelectBankProps();
  const moveDroppable = useMoveDroppableBank(bankId);
  const moveLoading = useMoveLoadingBank(bankId);

  const banksQuery = useStorageGetMainBanks();
  const bankDeleteMutation = useStorageDeleteMainBank();
  const boxesQuery = useStorageGetBoxes();
  const pkmsQuery = usePkmVariantIndex();

  const isLoading = moveLoading || [ selectedBankBoxes, banksQuery, boxesQuery, pkmsQuery ].some(query => query.isLoading);

  const banks = banksQuery.data?.data ?? [];
  const bank = banks.find(item => item.id === bankId);
  const boxes = boxesQuery.data?.data.filter(box => box.bankId === bank?.id).map(box => box.idInt) ?? [];
  const pkms = boxes.map(boxId => Object.values(pkmsQuery.data?.data.byBox[ boxId ] ?? {}).flat()).flat();

  const canDelete = banks.length > 1;

  const buttonMainContent = bank && (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
      })}
    >
      {bank.isDefault && (
        <Icon
          name='star'
          solid
          forButton
          className={css({
            alignSelf: 'flex-start',
            marginRight: 4,
          })}
        />
      )}
      {bank.name}
      <br />
      {t('storage.bank.description', {
        boxCount: boxes.length,
        pkmCount: pkms.length,
      })}
    </div>
  );

  return (
    bank && (
      <div
        className={css({
          display: 'inline-flex',
          order: bank.order,
        })}
      >
        {moveDroppable.isDragging ? (
          <ButtonWithDisabledPopover
            as={Button}
            onClick={moveDroppable.onClick}
            disabled={!moveDroppable.onClick}
            selected={selectedBankBoxes.data?.selectedBank.id === bankId}
            loading={isLoading}
            onPointerUp={moveDroppable.onPointerUp}
            anchor='bottom'
            showHelp={!!moveDroppable.helpText}
            helpTitle={moveDroppable.helpText}
            className={css({
              flexGrow: 1,
              zIndex: 1,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            })}
          >
            {buttonMainContent}
          </ButtonWithDisabledPopover>
        ) : (
          <ButtonLink
            to='/storage'
            {...selectBankProps(bankId)}
            selected={selectedBankBoxes.data?.selectedBank.id === bankId}
            loading={isLoading}
            className={css({
              zIndex: 1,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            })}
          >
            {buttonMainContent}
          </ButtonLink>
        )}

        <div>
          <ButtonWithPopover
            panelContent={close => <BankEdit bankId={bankId} close={close} />}
            loading={isLoading}
            className={css({
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            })}
          >
            <Icon name='pen' forButton />
          </ButtonWithPopover>

          <ButtonWithConfirm
            onClick={() => bankDeleteMutation.mutateAsync({ bankId })}
            disabled={!canDelete}
            loading={isLoading}
            className={css({
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: 0,
            })}
          >
            <Icon name='trash' solid forButton />
          </ButtonWithConfirm>
        </div>
      </div>
    )
  );
};
