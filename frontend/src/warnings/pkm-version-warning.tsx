import type React from 'react';
import { useStorageGetMainPkms, useStorageGetMainPkmVersions } from '../data/sdk/storage/storage.gen';
import { useStaticData } from '../data/static-data/static-data';
import { useCurrentLanguageName } from '../data/hooks/use-current-language-name';
import { Button } from '../ui/button/button';
import { Route } from '../routes/storage';

export type PkmVersionWarningProps = {
    pkmVersionId: string;
};

export const PkmVersionWarning: React.FC<PkmVersionWarningProps> = ({ pkmVersionId }) => {
    const getCurrentLanguageName = useCurrentLanguageName();
    const pkmSpeciesRecord = useStaticData().pokemonSpecies;

    const navigate = Route.useNavigate();

    const pkmsQuery = useStorageGetMainPkms();
    const pkmVersionsQuery = useStorageGetMainPkmVersions();

    const pkmVersion = pkmVersionsQuery.data?.data.find(pkmVersion => pkmVersion.id === pkmVersionId);
    const pkm = pkmVersion && pkmsQuery.data?.data.find(pkm => pkm.id == pkmVersion.pkmId);

    if (!pkmVersion || !pkm) {
        return null;
    }

    const pokemonSpeciesInfos = pkmSpeciesRecord[ pkm.species ];
    const speciesName = getCurrentLanguageName(pokemonSpeciesInfos.names);

    return <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    }}>
        Issue with pkm {speciesName} in box {pkm.boxId} slot {pkm.boxSlot}, not found in attached save <Button onClick={() => navigate({
            to: '/storage',
            search: {
                mainBoxId: pkm.boxId,
                save: pkm.saveId,
                saveBoxId: undefined,
                selected: {
                    type: 'main',
                    id: pkm.id,
                },
            }
        })}>Check</Button>
    </div>;
};
