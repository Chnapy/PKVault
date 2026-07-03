import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { UIGlobsInputResults } from '../../ui-new/form/globs-input/ui-globs-input-results';

export type GlobsInputResultsProps = {
    values: string[];
    limit: number;
};

export const GlobsInputResults: React.FC<GlobsInputResultsProps> = ({ values, limit }) => {
    const globResultsQuery = useSettingsGetSaveGlobsResults({ globs: values, limit });

    const { isLoading } = globResultsQuery;
    const data = globResultsQuery.data?.data ?? [];

    const showFiles = data.length > 0;

    const hasError = !globResultsQuery.isLoading && globResultsQuery.isError;

    return <UIGlobsInputResults
        name='results'
        data={data}
        showFiles={showFiles}
        isLoading={isLoading}
        hasError={hasError}
    />;

};
