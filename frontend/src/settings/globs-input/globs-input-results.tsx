import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { UIGlobsInputResults } from '../../ui/form/globs-input/ui-globs-input-results';

export type GlobsInputResultsProps = {
    values: string[];
    limit: number;
};

export const GlobsInputResults: React.FC<GlobsInputResultsProps> = ({ values, limit }) => {
    const globResultsQuery = useSettingsGetSaveGlobsResults({ globs: values, limit });

    const data = globResultsQuery.data?.data ?? [];

    const showFiles = data.length > 0;

    const isLoading = globResultsQuery.isPending && globResultsQuery.isEnabled;
    const hasError = !isLoading && globResultsQuery.isError;

    return <UIGlobsInputResults
        name='results'
        data={data}
        showFiles={showFiles}
        isLoading={isLoading}
        hasError={hasError}
    />;

};
