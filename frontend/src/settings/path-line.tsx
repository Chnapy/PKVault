
export const PathLine: React.FC<{ children: string }> = ({ children }) => {
    const parts = children.split('/');
    const filename = parts.pop();
    const directory = parts.pop();

    const firstPartsStr = parts.join('/');

    return <div
        title={children}
        style={{
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
        }}
    >
        {firstPartsStr && <>
            <div
                style={{
                    opacity: 0.5,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    minWidth: 10,
                }}
            >
                {firstPartsStr}
            </div>/
        </>}
        {directory && <div
        // style={{ opacity: 0.5 }}
        >
            {directory}/
        </div>}
        {filename}
    </div>;
};
