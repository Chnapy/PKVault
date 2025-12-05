import type React from 'react';
import { useStorageDeleteMainBank, useStorageGetMainBanks, useStorageGetMainBoxes } from '../../data/sdk/storage/storage.gen';
import { ButtonLink } from '../../ui/button/button';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { ButtonWithPopover } from '../../ui/button/button-with-popover';
import { Icon } from '../../ui/icon/icon';
import { BankContext } from './bank-context';
import { BankEdit } from './bank-edit';

export const BankItem: React.FC<{
    bankId: string;
}> = ({ bankId }) => {
    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const selectBank = BankContext.useSelectBankProps();

    const banksQuery = useStorageGetMainBanks();
    const bankDeleteMutation = useStorageDeleteMainBank();
    const boxesQuery = useStorageGetMainBoxes();

    const banks = banksQuery.data?.data ?? [];
    const bank = banks.find(item => item.id === bankId);
    const boxNbr = boxesQuery.data?.data.filter(box => box.bankId === bank?.id).length;

    return bank && <div
        style={{
            display: 'inline-flex'
        }}
    >

        <ButtonLink
            to='/storage'
            {...selectBank(bankId)}
            selected={selectedBankBoxes.data?.selectedBank.id === bankId}
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
                <br />{boxNbr} boxes
            </div>
        </ButtonLink>

        <div>
            <ButtonWithPopover
                panelContent={close => <BankEdit bankId={bankId} close={close} />}
                style={{
                    // borderLeftWidth: 0,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                }}
            >
                <Icon name='pen' forButton />
            </ButtonWithPopover>

            <ButtonWithConfirm
                onClick={() => bankDeleteMutation.mutateAsync({ bankId })}
                disabled={bank.isDefault || banks.length <= 1}
                style={{
                    // borderLeftWidth: 0,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 0,
                }}
            >
                <Icon name='trash' solid forButton />
            </ButtonWithConfirm>
        </div>

    </div>;
};
