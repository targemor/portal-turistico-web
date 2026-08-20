/**
 * react/AppShell.tsx
 * Wrapper compartido que provee el LanguageProvider a NavBar y BottomNav.
 * Al ser un único árbol React, ambos comparten el mismo estado de idioma.
 * Nota: WhatsappFloatButton es un componente Astro y se mantiene en BottomNav.astro.
 */

import { LanguageProvider } from '../../i18n/LanguageContext';
import NavBar from './NavBar';
import BottomNav from './BottomNav';

interface AppShellProps {
  forceNavBackground?: boolean;
}

export default function AppShell({ forceNavBackground = false }: AppShellProps) {
  return (
    <LanguageProvider>
      <NavBar forceBackground={forceNavBackground} />
      <BottomNav />
    </LanguageProvider>
  );
}
