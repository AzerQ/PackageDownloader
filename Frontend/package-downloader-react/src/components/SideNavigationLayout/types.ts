import React from 'react';

export interface SideNavigationItem {
    id: string | number;
    icon: React.ReactNode;
    label: string;
    content: React.ReactNode;
}

export interface SideNavigationLayoutProps {
    items: SideNavigationItem[];
    children: React.ReactNode;
    initialActiveItemId?: string | number | null;
    initialSidebarOpen?: boolean;
    onItemClick?: (id: string | number) => void;
    onCloseSidebar?: () => void;
    activityBarWidth?: number | string;
    sidebarWidth?: number | string;
    backgroundColor?: string;
    minSidebarWidth: number;
    maxSidebarWidth: number;
}

export interface ActivityBarProps {
    items: SideNavigationItem[];
    activeItemId: string | number | null;
    onItemClick: (id: string | number) => void;
    width: number | string;
    backgroundColor?: string;
}

export interface SidebarPanelProps {
    item: SideNavigationItem | undefined; // Активный элемент (или undefined, если нет)
    isOpen: boolean;
    onClose: () => void;
    width: number | string;
}

