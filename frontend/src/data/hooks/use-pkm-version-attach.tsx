import type { PkmDTO } from '../sdk/model';
import { useWarningsGetWarnings } from '../sdk/warnings/warnings.gen';

export const usePkmVersionAttach = () => {
    const warningsQuery = useWarningsGetWarnings();

    return (pkm: Pick<PkmDTO, 'id' | 'saveId'>, pkmVersionId: string) => {
        const isAttachedValid = pkm.saveId == null
            || warningsQuery.isLoading
            || !warningsQuery.data?.data.pkmVersionWarnings.some(warn => warn.pkmVersionId == null
                ? warn.pkmId == pkm.id
                : warn.pkmVersionId == pkmVersionId);

        return {
            isAttachedValid,
        };
    };
};
