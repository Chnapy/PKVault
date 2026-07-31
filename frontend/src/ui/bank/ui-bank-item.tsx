import { Group } from '@mantine/core';
import { ExternalLinkIcon, StarIcon } from 'lucide-react';
import { useDragSubmitting } from '../interaction/move/hooks/use-drag-submitting';
import { useDroppable } from '../interaction/move/hooks/use-droppable';
import type { UISubHeaderTabsData } from '../layout/header/sub-header/ui-sub-header';
import { UISubHeaderTab } from '../layout/header/sub-header/ui-sub-header-tab';

export type UIBankItemProps<C = unknown> = UISubHeaderTabsData & {
    container: C;
    isDefault?: boolean;
    isExternal?: boolean;
};

export const UIBankItem: React.FC<UIBankItemProps> = ({ container, isDefault, isExternal, ...rest }) => {
    const { onClick, onPointerUp, canDrop } = useDroppable({
        targetContainer: container,
        targetPosition: -1,
        targetId: undefined,
    });

    const submitting = useDragSubmitting(container, -1);

    return <UISubHeaderTab
        {...rest}
        label={<Group wrap='nowrap'>
            {rest.label}
            {isDefault && <StarIcon />}
            {isExternal && <ExternalLinkIcon />}
        </Group>}
        onClick={onClick}
        onPointerUp={onPointerUp}
        disabled={canDrop === false}
        loading={submitting}
    />;
};
