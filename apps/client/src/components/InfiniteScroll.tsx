import { useEffect, useRef, useState } from 'react';

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

/**
 * A component that implements infinite scrolling using Intersection Observer
 *
 * @param hasMore - Boolean indicating if there are more items to load
 * @param isLoading - Boolean indicating if items are currently being loaded
 * @param onLoadMore - Function to call when more items should be loaded
 * @param children - The content to render
 * @param threshold - The threshold at which to trigger loading more items (0-1)
 * @param className - Optional CSS class name
 */
const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  hasMore,
  isLoading,
  onLoadMore,
  children,
  threshold = 0.8,
  className = ''
}) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div ref={observerTarget} style={{ height: '20px', width: '100%' }}>
          {isLoading && isIntersecting && (
            <div style={{ textAlign: 'center', padding: '10px' }}>Loading more...</div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
