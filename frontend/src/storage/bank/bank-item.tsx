import type React from 'react';
import { useStorageDeleteMainBank, useStorageGetMainBanks, useStorageGetMainBoxes, useStorageGetMainPkms } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { ButtonLink } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { ButtonWithDisabledPopover } from '../../ui/button/button-with-disabled-popover';
import { ButtonWithPopover } from '../../ui/button/button-with-popover';
import { Icon } from '../../ui/icon/icon';
import { BankContext } from './bank-context';
import { BankEdit } from './bank-edit';

export const BankItem: React.FC<{
    bankId: string;
}> = ({ bankId }) => {
    const { t } = useTranslate();
    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const selectBankProps = BankContext.useSelectBankProps();

    const banksQuery = useStorageGetMainBanks();
    const bankDeleteMutation = useStorageDeleteMainBank();
    const boxesQuery = useStorageGetMainBoxes();
    const pkmsQuery = useStorageGetMainPkms();

    const isLoading = [ selectedBankBoxes, banksQuery, boxesQuery, pkmsQuery ].some(query => query.isLoading);

    const banks = banksQuery.data?.data ?? [];
    const bank = banks.find(item => item.id === bankId);
    const boxes = boxesQuery.data?.data.filter(box => box.bankId === bank?.id).map(box => box.idInt) ?? [];
    const pkms = pkmsQuery.data?.data.filter(pkm => boxes.includes(pkm.boxId));

    const canDelete = !bank?.isDefault && pkms?.length === 0;

    return bank && <div
        style={{
            display: 'inline-flex',
            order: bank.order,
        }}
    >
        <ButtonLink
            to='/storage'
            {...selectBankProps(bankId)}
            selected={selectedBankBoxes.data?.selectedBank.id === bankId}
            loading={isLoading}
            style={{
                zIndex: 1,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
            }}>
                {bank.isDefault && <Icon name='star' solid forButton style={{
                    alignSelf: 'flex-start',
                    marginRight: 4,
                }} />}
                {bank.name}
                <br />{t('storage.bank.description', { boxCount: boxes.length, pkmCount: pkms?.length ?? '-' })}
            </div>
        </ButtonLink>

        <div>
            <ButtonWithPopover
                panelContent={close => <BankEdit bankId={bankId} close={close} />}
                loading={isLoading}
                style={{
                    // borderLeftWidth: 0,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                }}
            >
                <Icon name='pen' forButton />
            </ButtonWithPopover>

            <ButtonWithDisabledPopover
                as={ButtonWithConfirm}
                helpTitle={t('storage.bank.delete.help')}
                showHelp={!canDelete}
                onClick={() => bankDeleteMutation.mutateAsync({ bankId })}
                disabled={!canDelete}
                loading={isLoading}
                style={{
                    // borderLeftWidth: 0,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 0,
                }}
            >
                <Icon name='trash' solid forButton />
            </ButtonWithDisabledPopover>
        </div>
    </div>;
};
