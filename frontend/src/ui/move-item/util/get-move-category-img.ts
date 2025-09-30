import { switchUtilRequired } from '../../../util/switch-util';
import { MoveCategory } from '../../../data/sdk/model';

import physicalImg from '../../../assets/move_categories/physical.png';
import specialImg from '../../../assets/move_categories/special.png';
import statusImg from '../../../assets/move_categories/status.png';

export const getMoveCategoryImg = (category: MoveCategory) => switchUtilRequired(category, {
    [ MoveCategory.PHYSICAL ]: () => physicalImg,
    [ MoveCategory.SPECIAL ]: () => specialImg,
    [ MoveCategory.STATUS ]: () => statusImg,
})();
