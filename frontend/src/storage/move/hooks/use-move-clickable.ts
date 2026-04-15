import { usePkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { StorageSelectContext } from '../../actions/storage-select-context';
import { MoveContext } from '../context/move-context';

type UseMoveClickableReturn = {
    moveCount: number;
    moveAttachedCount: number;
    startDrag?: () => void;
    startDragAttached?: () => void;
    onPointerMove?: (e: React.PointerEvent) => void;
};

/**
 * Define if given pkms can be moved (by click or drag).
 */
export const useMoveClickable = (pkmIdsRaw: string[], saveId: number | undefined): UseMoveClickableReturn => {
    const { state, dispatch } = MoveContext.useValue();
    const selectContext = StorageSelectContext.useValue();

    const mainPkmVariantsQuery = usePkmVariantIndex();
    const savePkmsQuery = usePkmSaveIndex(saveId ?? 0);

    if (state.status !== 'idle') {
        return {
            moveCount: 0,
            moveAttachedCount: 0,
        };
    }

    const pkmIds = pkmIdsRaw.some(id => selectContext.hasPkm(saveId, id)) ? selectContext.ids : pkmIdsRaw;

    const pkmMains = !saveId ? pkmIds.map(id => mainPkmVariantsQuery.data?.data.byId[ id ]).filter(filterIsDefined) : [];
    const pkmSaves = saveId ? pkmIds.map(id => savePkmsQuery.data?.data.byId[ id ]).filter(filterIsDefined) : [];

    const canClickIds = !saveId
        ? pkmMains.filter(pkm => pkm.canMove).map(pkm => pkm.id)
        : pkmSaves.filter(pkmSave => pkmSave.canMove || pkmSave.canMoveToMain).map(pkm => pkm.id);

    const canClickAttachedIds = !saveId
        ? pkmMains.filter(pkmMain => pkmMain.canMoveAttachedToSave).map(pkm => pkm.id)
        : pkmSaves.filter(pkmSave => pkmSave.canMoveAttachedToMain).map(pkm => pkm.id);

    let enablePointerMove = true;

    const startDrag = canClickIds.length > 0
        ? () => {
            dispatch({
                type: 'START_DRAG',
                source: {
                    ids: canClickIds,
                    saveId,
                },
            });
        }
        : undefined;

    const startDragAttached = canClickAttachedIds.length > 0
        ? () => {
            dispatch({
                type: 'START_DRAG',
                source: {
                    ids: canClickAttachedIds,
                    saveId,
                    attached: true,
                },
            });
        }
        : undefined;

    return {
        moveCount: canClickIds.length,
        startDrag,
        moveAttachedCount: canClickAttachedIds.length,
        startDragAttached,
        onPointerMove: startDrag
            ? (e: React.PointerEvent) => {
                if (enablePointerMove && e.buttons === 1) {
                    enablePointerMove = false;
                    startDrag();
                }
            }
            : undefined,
    };
};
