'use client'
 
import React, { createContext, useContext, useState } from 'react';
import { MenuApiResponse } from '@/lib/menu-utils';
 
interface MenuContextType {
  menuData: MenuApiResponse[];
  setMenuData: (data: MenuApiResponse[]) => void;
}
 
const MenuContext = createContext<MenuContextType | undefined>(undefined);
 
export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menuData, setMenuData] = useState<MenuApiResponse[]>([]);
 
  return (
    <MenuContext.Provider value={{ menuData, setMenuData }}>
      {children}
    </MenuContext.Provider>
  );
}
 
export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}