/**
 * Portal — renders children directly into document.body.
 *
 * This escapes any stacking context created by parent elements
 * (CSS transitions, transforms, etc.) so modals always cover
 * the full viewport including the sidebar.
 */

import { createPortal } from 'react-dom';

export default function Portal({ children }) {
  return createPortal(children, document.body);
}
