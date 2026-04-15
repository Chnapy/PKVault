import { useTranslate } from '../../translate/i18n';
import docsGen from '../docs.gen';

export const useHelpMenuItems = () => {
    const language = useTranslate().i18n.language;

    const menuItems = docsGen
        .filter(item => item.language === language);

    if (menuItems.length === 0) {
        return {
            language: 'en',
            menuItems: docsGen.filter(item => item.language === 'en')
        };
    }

    return {
        language,
        menuItems: docsGen.filter(item => item.language === language)
    };
};
