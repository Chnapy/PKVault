import type React from 'react';
import { useWarningsGetWarnings } from '../data/sdk/warnings/warnings.gen';
import { Container } from '../ui/container/container';
import { PkmVersionWarning } from './pkm-version-warning';

export const Warnings: React.FC = () => {
    const { data } = useWarningsGetWarnings();

    const warnings = data?.data;

    if (!warnings?.playTimeWarnings.length
        && !warnings?.pkmVersionWarnings.length) {
        return null;
    }

    return <Container padding='big'>
        {warnings.playTimeWarnings.map(warn => <div key={warn.saveId}>
            Issue with save {warn.saveId}, current save seems to have less play-time than previous one
        </div>)}

        {warnings.pkmVersionWarnings.map(warn => <PkmVersionWarning key={warn.pkmVersionId} pkmVersionId={warn.pkmVersionId} />)}
    </Container>;
};
