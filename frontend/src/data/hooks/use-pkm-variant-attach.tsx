import type { PkmVariantDTO } from '../sdk/model';
import { useWarningsGetWarnings } from '../sdk/warnings/warnings.gen';

export const usePkmVariantAttach = () => {
    const warningsQuery = useWarningsGetWarnings();

    return (pkm: Pick<PkmVariantDTO, 'id' | 'attachedSaveId'>, pkmVariantId: string) => {
        const isAttachedValid =
            pkm.attachedSaveId == null ||
            warningsQuery.isLoading ||
            !warningsQuery.data?.data.pkmVariantWarnings.some((warn) => warn.pkmVariantId == pkmVariantId);

        return {
            isAttachedValid,
        };
    };
};
