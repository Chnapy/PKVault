import React from 'react';
import { useSettingsGetSaveGlobsResults } from '../../data/sdk/settings/settings.gen';
import { UIGlobsInputItem, type UIGlobsInputItemProps } from '../../ui/form/globs-input/ui-globs-input-item';
import { useDesktopMessage } from './hooks/use-desktop-message';

export type GlobsInputItemProps = Pick<UIGlobsInputItemProps, 'name' | 'value' | 'onEdit' | 'onRemove' | 'disabled'> & {
    limit: number;
};

export const GlobsInputItem: React.FC<GlobsInputItemProps> = ({ name, value, onEdit, onRemove, limit, disabled }) => {
    const desktopMessage = useDesktopMessage();

    const isGlob = value.includes('*');
    const isDirectory = isGlob || value.endsWith('/');
    const isExclude = value.startsWith('!');

    const globResultsQuery = useSettingsGetSaveGlobsResults({
        globs: [ value ],
        limit,
    }, {
        query: {
            enabled: !isExclude,
        },
    });

    const data = globResultsQuery.data?.data ?? [];

    const isLoading = globResultsQuery.isPending && globResultsQuery.isEnabled;
    const hasError = !isLoading && globResultsQuery.isError;
    const hasWarning = !isLoading && (hasError || data.length === 0);

    return <UIGlobsInputItem
        name={name}
        value={value}
        onEdit={onEdit}
        onRemove={onRemove}
        disabled={disabled}
        results={data}
        isDesktop={!!desktopMessage}
        hasError={hasError}
        hasWarning={hasWarning}
        isLoading={isLoading}
        openFolder={desktopMessage && (() => desktopMessage.openFile({
            type: 'open-folder',
            isDirectory,
            path: value,
        }))}
    />;
};
