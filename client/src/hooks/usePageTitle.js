import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ApexMarket` : 'ApexMarket — Supermarket Management System';
    return () => { document.title = prev; };
  }, [title]);
}
