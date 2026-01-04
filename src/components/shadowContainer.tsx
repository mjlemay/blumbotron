import { useRef, useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ShadowContainerProps = {
  /** Content to render inside the shadow DOM */
  children: ReactNode;
  /** CSS string to inject into the shadow root */
  styles?: string;
  /** Class name for the host element (outside shadow DOM) */
  className?: string;
  /** Inline styles for the host element (outside shadow DOM) */
  style?: React.CSSProperties;
};

/**
 * ShadowContainer wraps content in a Shadow DOM for complete style isolation.
 *
 * Key behaviors:
 * - Styles from the parent document cannot leak into the shadow root
 * - Styles inside the shadow root cannot affect the parent document
 * - Tailwind/global CSS classes won't work inside - use the `styles` prop
 *
 * @example
 * ```tsx
 * <ShadowContainer styles={`
 *   .content { color: red; }
 * `}>
 *   <div className="content">Isolated content</div>
 * </ShadowContainer>
 * ```
 */
function ShadowContainer({ children, styles, className, style }: ShadowContainerProps): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) {
      const shadow = hostRef.current.attachShadow({ mode: 'open' });
      setShadowRoot(shadow);
    } else if (hostRef.current?.shadowRoot) {
      setShadowRoot(hostRef.current.shadowRoot);
    }
  }, []);

  return (
    <div ref={hostRef} className={className} style={style}>
      {shadowRoot && createPortal(
        <>
          {styles && <style>{styles}</style>}
          {children}
        </>,
        shadowRoot
      )}
    </div>
  );
}

export default ShadowContainer;
