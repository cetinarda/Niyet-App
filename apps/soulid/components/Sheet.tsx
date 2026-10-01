'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

// Detail sheet used by ConceptCard and the 3D sky planet detail.
//
// Why a portal: inside the Sakin iOS WKWebView iframe these sheets were
// rendered in the page tree. Any ancestor with a transform (page fade-in,
// card hover, etc.) becomes the reference box for `position: fixed`, so the
// sheet landed at the very bottom of the long page while the dim overlay
// covered the screen ("screen dims and looks frozen"). Rendering into
// document.body keeps it pinned to the viewport. Body scroll is locked while
// open (position:fixed trick, the only reliable lock in iOS WebKit) and
// restored on close.

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyle = '';

function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  lockCount += 1;
  if (lockCount > 1) return;
  const body = document.body;
  savedScrollY = window.scrollY || window.pageYOffset || 0;
  savedBodyStyle = body.getAttribute('style') ?? '';
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  const body = document.body;
  if (savedBodyStyle) body.setAttribute('style', savedBodyStyle);
  else body.removeAttribute('style');
  // html has `scroll-behavior: smooth`; restore instantly, otherwise the page
  // would visibly glide down from the top after closing.
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedScrollY);
  html.style.scrollBehavior = prev;
}

type Props = {
  onClose: () => void;
  /** Extra classes for the dim overlay (padding / alignment per breakpoint). */
  overlayClassName?: string;
  /** Classes for the sheet panel itself (width, border, padding...). */
  panelClassName?: string;
  children: ReactNode;
};

export function Sheet({ onClose, overlayClassName, panelClassName, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    setMounted(true);
    lockBodyScroll();
    // Next frame: flip to the "in" state so the transition actually runs.
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      unlockBodyScroll();
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-[100] flex items-end justify-center bg-black/85 transition-opacity duration-200 ease-out motion-reduce:transition-none',
        shown ? 'opacity-100' : 'opacity-0',
        overlayClassName,
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={clsx(
          // 88vh fallback, 88dvh where supported (iOS toolbar-aware height).
          'max-h-[88vh] supports-[height:100dvh]:max-h-[88dvh] w-full overflow-y-auto overscroll-contain bg-bgElevated transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          shown ? 'translate-y-0' : 'translate-y-full md:translate-y-6',
          panelClassName,
        )}
        style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
