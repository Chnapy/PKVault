import { getSelectControl } from '../../interaction/focus-controls/common-controls/select-controls';
import { useFocusControls, type UseFocusControlsParams } from '../../interaction/focus-controls/use-focus-controls';
import { Focus } from '../../interaction/focus/provider/use-focus-context';
import classes from './panel-controlled.module.css';

type Params = Partial<
    Omit<UseFocusControlsParams, 'scopeNodeId' | 'childScopeId' | 'controls'>
>;

export const usePanelControls = (name: string, focusControlsParams?: Params) => {
    const childScopeId = name;

    const isInScopeStack = Focus.useIsInScopeStack(childScopeId);

    const { pushScope } = Focus.usePushPopScope();

    const { focusControlProps, ...restFocus } = useFocusControls({
        scopeNodeId: name,
        childScopeId,
        controls: [
            getSelectControl({
                label: 'Select',
                action: () => pushScope(childScopeId),
            }),
        ],
        ...focusControlsParams,
    });

    return {
        panelProps: {
            ...focusControlProps,
            'data-focus-in-scope': isInScopeStack || undefined,
            className: classes.panelControlled,
        },
        childScopeId,
        ...restFocus,
    };
};
