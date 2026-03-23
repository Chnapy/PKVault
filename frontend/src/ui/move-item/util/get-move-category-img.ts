import { MoveCategory } from '../../../data/sdk/model';
import { switchUtilRequired } from '../../../util/switch-util';
import { iconResources } from '../../icon/icon-resources';

export const getMoveCategoryImg = (category: MoveCategory) => switchUtilRequired(category, {
    [ MoveCategory.PHYSICAL ]: () => iconResources.moveCategory.physical,
    [ MoveCategory.SPECIAL ]: () => iconResources.moveCategory.special,
    [ MoveCategory.STATUS ]: () => iconResources.moveCategory.status,
})();
