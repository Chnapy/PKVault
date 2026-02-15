import { css } from '@emotion/css';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { Route } from '../routes/__root';
import { useTranslate } from '../translate/i18n';
import { ButtonLink } from '../ui/button/button';
import { ButtonLike } from '../ui/button/button-like';
import { TitledContainer } from '../ui/container/titled-container';
import { Icon } from '../ui/icon/icon';
import { theme } from '../ui/theme';
import docsGen from './docs.gen';
import { useHelpNavigate } from './hooks/use-help-navigate';

const menuEn = docsGen
    .filter(item => item.language === 'en');

export const HelpDialog: React.FC = () => {
    const { t, i18n } = useTranslate();
    const lang = i18n.language;

    const helpPath = Route.useSearch({ select: search => search.help ?? '' });
    const helpNavigate = useHelpNavigate();

    const [ helpHash, helpAnchor ] = helpPath.split('#');

    const menu = docsGen
        .filter(item => item.language === lang);
    const menuItem = menu.find(item => item.endPath === helpHash) ?? menu[ 0 ];

    const selectedEndPath = menuItem?.endPath;

    const finalSelectedPath = `/docs/${lang}/${selectedEndPath}`;

    const contentQuery = useQuery({
        queryKey: [ finalSelectedPath ],
        queryFn: () => fetch(finalSelectedPath ?? '')
            .then(res => res.text()),
        enabled: !!finalSelectedPath,
    });

    const persistContent = React.useRef('');

    const content = contentQuery.data;
    if (!contentQuery.isLoading) {
        persistContent.current = content ?? '';
    }

    const markdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const getElement = () => {
            if (!markdownRef.current || !helpAnchor || !content || !menuItem) {
                // console.log('no helpAnchor/content', { helpAnchor, content });
                return;
            }

            const element = markdownRef.current.querySelector(`#${CSS.escape(helpAnchor)}`);
            if (element) {
                // console.log('scroll to', helpAnchor);
                return element;
            }

            const enItem = menuEn.find(item => item.endPath === selectedEndPath);
            const slugIndex = enItem?.slugs.indexOf(helpAnchor as never) ?? -1;
            const newAnchor = menuItem.slugs[ slugIndex ];
            if (newAnchor) {
                // console.log('scroll to', newAnchor);
                return markdownRef.current.querySelector(`#${CSS.escape(newAnchor)}`);
            }
            // console.log('anchor not found');
        };

        setTimeout(
            () => getElement()?.scrollIntoView(),
            200
        );
    }, [ helpAnchor, content, menuItem, selectedEndPath ]);

    const getUrlHashAndParams = () => {
        const parts = window.location.hash.split('?');
        const hash = parts[ 0 ] || '#';

        const searchParamsStr = parts[ 1 ] ?? '';
        const searchParams = new URLSearchParams(searchParamsStr);

        return {
            hash,
            searchParams
        };
    };

    const onClose = () => helpNavigate(undefined);

    return (
        <Dialog
            className={css({
                position: 'relative',
                zIndex: 50,
            })}
            open={!!helpPath}
            // unmount={false}
            onClose={onClose}
        >
            <DialogBackdrop
                className={css({
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.25)'
                })}
            />

            <div
                className={css({
                    zIndex: 10,
                    position: 'fixed',
                    width: '100%',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 16,
                })}
            >
                <DialogPanel
                    className={css({
                        width: 768,
                        height: 600,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: 'flex',
                    })}
                >
                    <TitledContainer
                        contrasted
                        className={css({
                            flexGrow: 1,
                        })}
                        title={<div
                            className={css({
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                paddingLeft: 4,
                            })}
                        >
                            {t('header.help')}

                            <ButtonLike
                                onClick={onClose}>
                                <Icon name='times' />
                            </ButtonLike>
                        </div>}
                    >
                        <div
                            className={css({
                                display: 'flex',
                                alignItems: 'flex-start',
                                height: '100%',
                                gap: 8,
                            })}
                        >
                            <div
                                className={css({
                                    position: 'sticky',
                                    top: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexShrink: 0,
                                    gap: 4,
                                    width: 200,
                                })}
                            >
                                {menu.map(menuItem => {
                                    const selected = menuItem.path === finalSelectedPath;

                                    return <ButtonLink
                                        key={menuItem.id}
                                        to={'.'}
                                        search={{ help: menuItem.endPath }}
                                        selected={selected}
                                        disabled={selected}
                                    >
                                        {menuItem.title}
                                    </ButtonLink>;
                                })}
                            </div>

                            <TitledContainer
                                className={css({
                                    flexGrow: 1,
                                    height: '100%',

                                    'h1,h2,h3': {
                                        borderBottomWidth: 1,
                                        borderBottomStyle: 'solid',
                                        borderBottomColor: 'rgba(0,0,0,0.1)',
                                        textShadow: 'none',
                                    },
                                    h1: {
                                        fontSize: '1.8em',
                                        margin: 0,
                                    },
                                    a: {
                                        color: theme.text.primary,

                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    },
                                    code: {
                                        fontSize: '0.8em',
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                        textShadow: 'none',
                                        borderRadius: 3,
                                        padding: '0 .4em',
                                        whiteSpace: 'break-spaces',
                                    },
                                    summary: {
                                        cursor: 'pointer',

                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    },
                                    details: {
                                        padding: 4,
                                        margin: '2px 0',
                                        transition: 'background-color .2s',

                                        '&[open], &:hover': {
                                            backgroundColor: 'rgba(0,0,0,0.02)'
                                        },

                                        '> p': {
                                            marginLeft: '1em',
                                        }
                                    },
                                })}
                                title={null}
                            >
                                <div ref={markdownRef}>
                                    {persistContent.current && <ReactMarkdown
                                        rehypePlugins={[ rehypeSlug, rehypeRaw ]}
                                        urlTransform={url => {
                                            // https://...
                                            if (url.startsWith('http')) {
                                                return url;
                                            }

                                            // /.github/...
                                            if (url.startsWith('/')) {
                                                return `https://github.com/Chnapy/PKVault/blob/main${url}`;
                                            }

                                            // console.log({ url });

                                            // ./4-pokedex.md => 4-pokedex.md
                                            if (url.startsWith('./')) {
                                                url = `${url.slice(2)}`;
                                                // #attached-pokemons => 0-technical.md#attached-pokemons
                                            } else if (url.startsWith('#') && selectedEndPath) {
                                                url = `${selectedEndPath}${url}`;
                                            }

                                            const { hash, searchParams } = getUrlHashAndParams();

                                            searchParams.set('help', url);

                                            return `${hash}?${searchParams}`;
                                        }}
                                        components={components}
                                    >
                                        {persistContent.current}
                                    </ReactMarkdown>}
                                </div>
                            </TitledContainer>
                        </div>
                    </TitledContainer>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

const components: Components = {
    a: (props) => <a
        {...props}
        target={props.href?.startsWith('http') ? '__blank' : undefined}
    />,
};
