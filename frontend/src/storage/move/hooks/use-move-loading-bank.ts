import { MoveContext } from '../context/move-context';

/**
 * Is submitting move action to backend for given bank.
 */
export const useMoveLoadingBank = (bankId: string) => {
    const { state } = MoveContext.useValue();

    if (state.status !== 'loading') {
        return false;
    }

    const { target } = state;

    return target.type === 'bank'
        && bankId === target.bankId;
};
