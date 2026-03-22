import { useMutation } from '@tanstack/react-query';

type Payload = {
    userId: string;
    feedback: string;
};

const getURL = ({ userId, feedback }: Payload) => {
    // this form is public, and it is OK
    const url = new URL('https://docs.google.com/forms/d/e/1FAIpQLSdCstREGUm1PdWx_ax0623pjxoKSfm9GQVEo4VCWFkX_0mSBQ/formResponse');

    // url.searchParams.set('submit', 'Submit?usp=pp_url');
    url.searchParams.set('entry.1410263494', userId);
    url.searchParams.set('entry.93913383', feedback);

    return url;
};

export const useSendFeedback = () => {
    return useMutation({
        mutationKey: [ 'feedback' ],
        mutationFn: (payload: Payload) => fetch(getURL(payload), {
            method: 'POST',
            mode: 'no-cors',
        })
    });
};