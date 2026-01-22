import type { PkmVersionDTO } from '../sdk/model';
import { useWarningsGetWarnings } from '../sdk/warnings/warnings.gen';

export const usePkmVersionAttach = () => {
    const warningsQuery = useWarningsGetWarnings();

    return (pkm: Pick<PkmVersionDTO, 'id' | 'attachedSaveId'>, pkmVersionId: string) => {
        const isAttachedValid =
            pkm.attachedSaveId == null ||
            warningsQuery.isLoading ||
            !warningsQuery.data?.data.pkmVersionWarnings.some((warn) => warn.pkmVersionId == pkmVersionId);

        return {
            isAttachedValid,
        };
    };
};
