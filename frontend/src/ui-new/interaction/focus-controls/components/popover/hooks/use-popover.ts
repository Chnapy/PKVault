import React from 'react';
import { popoverContext } from '../context/popover-context';

export type UsePopoverValue = ReturnType<typeof usePopover>;

export const usePopover = () => {
    const ctx = React.use(popoverContext);

    return ctx?.usePopoverStore.setState;
};
