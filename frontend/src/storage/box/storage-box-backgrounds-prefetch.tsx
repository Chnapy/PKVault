import type React from 'react';
import { useStorageGetBoxes } from '../../data/sdk/storage/storage.gen';
import { ImgPrefetch } from '../../ui/icon/img-prefetch';
import { filterIsDefined } from '../../util/filter-is-defined';
import { getBoxBackgroundUrl } from './util/get-box-background-url';

export const StorageBoxBackgroundsPrefetch: React.FC<{ saveId?: number }> = ({ saveId }) => {
    const saveBoxesQuery = useStorageGetBoxes({ saveId });

    const wallpaperUrls = [ ...new Set(saveBoxesQuery.data?.data
        .map(box => box.wallpaperName)
        .filter(filterIsDefined)) ]
        .map(wallpaperName => getBoxBackgroundUrl(wallpaperName));

    return <div aria-description='prefetch'>
        {wallpaperUrls.map((wallpaperUrl, i) => <ImgPrefetch
            key={wallpaperUrl}
            src={wallpaperUrl}
            fetchPriority={i === 0 ? "high" : "low"}
        />)}
    </div>;
};
