import { css } from '@emotion/css';
import type React from 'react';
import { useStorageGetBoxes } from '../../data/sdk/storage/storage.gen';
import { filterIsDefined } from '../../util/filter-is-defined';
import { getBoxBackgroundUrl } from './util/get-box-background-url';

export const StorageBoxBackgroundsPrefetch: React.FC<{ saveId?: number }> = ({ saveId }) => {
    const saveBoxesQuery = useStorageGetBoxes({ saveId });

    const wallpaperUrls = [ ...new Set(saveBoxesQuery.data?.data
        .map(box => box.wallpaperName)
        .filter(filterIsDefined)) ]
        .map(wallpaperName => getBoxBackgroundUrl(wallpaperName));

    return <div className={css({
        opacity: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
    })}>
        {wallpaperUrls.map((wallpaperUrl, i) => <img
            key={wallpaperUrl}
            src={wallpaperUrl}
            fetchPriority={i === 0 ? "high" : "low"}
            loading="lazy"
        />)}
    </div>;
};
