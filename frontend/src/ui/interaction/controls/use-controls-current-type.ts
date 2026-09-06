import { useControlsContext } from './provider/use-controls-context';

export const useControlsCurrentType = () => {
    const { useControlsStore } = useControlsContext();

    return useControlsStore(s => s.currentType);
};
