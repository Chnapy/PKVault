import type { PkmSaveDTO } from '../sdk/model';
import { useWarningsGetWarnings } from '../sdk/warnings/warnings.gen';

export const usePkmSaveDuplicate = () => {
    const warningsQuery = useWarningsGetWarnings();

    return (pkmSave: Pick<PkmSaveDTO, 'idBase' | 'saveId' | 'canMoveToMain' | 'canDelete' | 'isValid'>) => {
        const isDuplicate = warningsQuery.data?.data.pkmDuplicateWarnings.some(warn =>
            warn.saveId === pkmSave.saveId && warn.duplicateIdBases.includes(pkmSave.idBase)
        );

        return {
            isDuplicate,
            canDelete: pkmSave.canDelete && !isDuplicate,
            canMoveAttachedToMain: pkmSave.canMoveToMain && !isDuplicate,
            isValid: pkmSave.isValid && !isDuplicate,
        };
    };
};
