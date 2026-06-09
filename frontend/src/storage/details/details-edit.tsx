import React from 'react';
import { usePkmIndex } from '../../data/hooks/use-pkm-index';
import type { EditPkmVariantPayload } from '../../data/sdk/model';
import { useStorageGetPkmAvailableMoves, useStorageMainEditPkmVariant, useStorageSaveEditPkm } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { UIDetailsContentMoveTable } from '../../ui-new/storage/storage-details/content/moves/ui-details-content-moves-table';
import { UIDetailsEdit } from '../../ui-new/storage/storage-details/edit/ui-details-edit';
import { useStaticMove } from '../../ui/move-item/hooks/use-static-move';
import { MoveItem } from '../../ui/move-item/move-item';
import { pick } from '../../util/pick';
import { useSelectCallback } from '../../util/use-select-callback';

export const DetailsEdit: React.FC<{ pkmId: string; saveId: number | null }> = ({ pkmId, saveId }) => {
    const staticData = useStaticData();

    const getStaticMove = useStaticMove(saveId, pkmId);

    const availableMovesQuery = useStorageGetPkmAvailableMoves({
        saveId: saveId ?? undefined,
        pkmId,
    });

    const editPkmVariantMutation = useStorageMainEditPkmVariant();
    const editPkmSaveMutation = useStorageSaveEditPkm();

    const pkmIndexQuery = usePkmIndex(saveId,
        useSelectCallback(data => {
            const pkm = data.data.byId[ pkmId ];
            if (!pkm)
                return undefined;

            return pick(pkm, [ 'id', 'context', 'contextVersion', 'nickname', 'nicknameMaxLength', 'moves', 'eVs', 'canEdit' ]);
        }, [ pkmId ]));

    const pkm = pkmIndexQuery.data;

    const availableMoves = React.useMemo(() => {
        if (!pkm || !availableMovesQuery.data)
            return [];

        const set = new Set([
            ...availableMovesQuery.data.data.map(move => move.id),
            ...pkm.moves,
        ]);

        return [ ...set ].sort((a, b) => {
            const sa = getStaticMove(a);
            const sb = getStaticMove(b);

            const typeDiff = (sa.forGen?.type ?? 0) - (sb.forGen?.type ?? 0);
            if (typeDiff !== 0) {
                return typeDiff;
            }

            const powerDiff = (sa.forGen?.power ?? 0) - (sb.forGen?.power ?? 0);
            return powerDiff;
        });

    }, [ availableMovesQuery.data, getStaticMove, pkm ]);

    const defaultValue = React.useMemo((): EditPkmVariantPayload => ({
        nickname: pkm?.nickname ?? '',
        eVs: pkm?.eVs ?? [],
        moves: pkm?.moves ?? [],
    }), [ pkm?.eVs, pkm?.moves, pkm?.nickname ]);

    if (!pkm || !pkm.canEdit)
        return null;

    const { maxEV } = staticData.versions[ pkm.contextVersion ]!;

    return <UIDetailsEdit
        defaultValues={defaultValue}
        nicknameMaxLength={pkm.nicknameMaxLength}
        minEv={0}
        maxEv={maxEV}
        availableMoves={availableMoves}
        renderMoveItemPill={(move, onRemove) => <UIDetailsContentMoveTable>
            <MoveItem
                pkmId={pkm.id}
                saveId={saveId}
                move={move}
                nameWidth={100}
                onClick={onRemove}
            />
        </UIDetailsContentMoveTable>}
        renderMoveItemOption={(move, selected, full) => <UIDetailsContentMoveTable>
            <MoveItem
                pkmId={pkm.id}
                saveId={saveId}
                move={move}
                nameWidth={100}
            />
        </UIDetailsContentMoveTable>}
        onSubmit={async data => {
            if (saveId) {
                await editPkmSaveMutation.mutateAsync({
                    saveId: saveId ?? undefined,
                    pkmId: pkm.id,
                    data,
                });
            } else {
                await editPkmVariantMutation.mutateAsync({
                    pkmVariantId: pkm.id,
                    data,
                });
            }
        }}
    />;
};
