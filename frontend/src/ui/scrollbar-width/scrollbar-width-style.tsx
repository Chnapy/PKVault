import React from 'react';

export const ScrollbarWidthStyle: React.FC = () => {
    const [ scrollbarWidth ] = React.useState(() => {
        try {
            const div = document.createElement('div');
            div.style.width = '100px';
            div.style.height = '100px';
            div.style.overflow = 'scroll';
            div.style.position = 'absolute';
            div.style.top = '-9999px';

            document.body.appendChild(div);

            const value = div.offsetWidth - div.clientWidth;

            document.body.removeChild(div);

            return value;
        } catch (err) {
            console.error(err);
            return 0;
        }
    });

    return <style
        dangerouslySetInnerHTML={{
            __html: `
    :root, :host {
        --scrollbar-width: ${scrollbarWidth}px;
    }
            `
        }}
    />
};
