import { translate, type Locale } from '@songsofdoom/common/localisation';

export const load = ({ params }: { params: { locale: Locale } }) => {
	return { title: translate({ ca: 'Inici', es: 'Inicio', en: 'Home' }, params.locale) };
};
