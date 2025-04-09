import { useCallback, useEffect, useRef } from 'react';

const printElement = (content: HTMLElement | null, printId: string) => {
  if (content) {
    const modalRoot = document.getElementById('print');

    const printNode = content.cloneNode(true);

    if (printNode && modalRoot) {
      modalRoot.replaceChildren(printNode);
      modalRoot.dataset.printId = printId;
    }
  }
};

export const usePrint = <T extends HTMLElement>({
  isPrimaryContent = false,
  onAfterPrint,
  onBeforePrint,
  // This is required to ensure that the correct afterprint event listener is called.
  id = 'print'
}: {
  isPrimaryContent?: boolean;
  onAfterPrint?: () => void;
  onBeforePrint?: () => void;
  id?: string;
} = {}) => {
  const printRef = useRef<T>(null);

  const handlePrint = useCallback(() => {
    // Using a ref and beforeprint event listener, ensures that loading images are printed.
    const handleBeforePrint = (e: Event) => {
      e.stopImmediatePropagation();
      onBeforePrint?.();
      printElement(printRef.current, id);
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.print();
    window.removeEventListener('beforeprint', handleBeforePrint);
  }, [id, onBeforePrint]);

  useEffect(() => {
    // If this is the primary content on the page then it should be printed when the user
    // uses the PRINT keyboard shortcut or prints from the web browser menu.
    if (isPrimaryContent) {
      const handleBeforePrint = () => {
        printElement(printRef.current, id);
      };

      window.addEventListener('beforeprint', handleBeforePrint);

      return () => {
        window.removeEventListener('beforeprint', handleBeforePrint);
      };
    }
  }, [isPrimaryContent, onAfterPrint, id]);

  useEffect(() => {
    const handleAfterPrint = () => {
      const printDiv = document.getElementById('print');

      if (printDiv?.dataset.printId === id) {
        printDiv.replaceChildren();
        onAfterPrint?.();
      }
    };

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onAfterPrint, id]);

  return { printRef, handlePrint };
};
