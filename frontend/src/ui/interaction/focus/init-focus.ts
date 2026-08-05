import { init, setKeyMap } from '@noriginmedia/norigin-spatial-navigation-core';

export const initFocus = () => {
    init({
        debug: false,
        visualDebug: false,
    });

    // disable default controls
    // we want to handle them manually
    setKeyMap({
        left: -9000,
        right: -9000,
        up: -9000,
        down: -9000,
        enter: -9000,
    });
};
