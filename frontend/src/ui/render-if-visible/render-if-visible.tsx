import React from "react";

/**
 * Render children only if visible (in viewport),
 * based on given minimal sizing.
 */
export const RenderIfVisible: React.FC<
  React.PropsWithChildren<{
    id: React.Key;
    minWidth: number;
    minHeight: number;
    initialVisible?: boolean;
  }>
> = ({ id, minWidth, minHeight, initialVisible = false, children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(initialVisible);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry?.isIntersecting ?? false);
      },
      {
        threshold: 0, // trigger from 0% visible
        rootMargin: minHeight * 2 + "px", // trigger from 2 lines above
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [minHeight, id]);

  return (
    <div
      ref={ref}
      style={{
        display: "inline-flex",
        minWidth,
        minHeight,
      }}
    >
      {visible && children}
    </div>
  );
};
