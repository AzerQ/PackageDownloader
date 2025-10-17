import React, {useState, useMemo, useRef, useCallback, useEffect} from 'react';
import {Box} from '@mui/material';
import ActivityBar from './ActivityBar';
import SidebarPanel from './SidebarPanel';
import {SideNavigationLayoutProps} from './types';


interface ResizeHandleProps {
    onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({onMouseDown}) => (
    <Box
        onMouseDown={onMouseDown}
        sx={{
            width: '5px',
            height: '100vh',
            cursor: 'col-resize',
            backgroundColor: 'action.hover',
            '&:hover': {
                backgroundColor: 'action.selected',
            },
            flexShrink: 0,
            userSelect: 'none',
        }}
    />
);


const SideNavigationLayout: React.FC<SideNavigationLayoutProps> = ({
                                                                       items,
                                                                       children,
                                                                       initialActiveItemId = null,
                                                                       initialSidebarOpen = true,
                                                                       onItemClick,
                                                                       onCloseSidebar,
                                                                       activityBarWidth = 60,
                                                                       sidebarWidth = 300,
                                                                       minSidebarWidth = 200,
                                                                       maxSidebarWidth = 600,
                                                                       backgroundColor,
                                                                   }) => {
    const [activeItemId, setActiveItemId] = useState<string | number | null>(initialActiveItemId);

    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(
        () => initialActiveItemId !== null && initialSidebarOpen
    );

    // Sync with external state when initialActiveItemId or initialSidebarOpen changes
    useEffect(() => {
        if (onItemClick) {
            setActiveItemId(initialActiveItemId);
            setIsSidebarOpen(initialSidebarOpen);
        }
    }, [initialActiveItemId, initialSidebarOpen, onItemClick]);

    const [currentSidebarWidth, setCurrentSidebarWidth] = useState<number>(
        typeof sidebarWidth === 'number' ? sidebarWidth : 300
    );

    const [isResizing, setIsResizing] = useState<boolean>(false);
    const layoutRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isResizing && typeof sidebarWidth === 'number') {
            setCurrentSidebarWidth(Math.max(minSidebarWidth, Math.min(maxSidebarWidth, sidebarWidth)));
        }
    }, [sidebarWidth, minSidebarWidth, maxSidebarWidth]);


    const activeItem = useMemo(() => {
        return items.find(item => item.id === activeItemId);
    }, [items, activeItemId]);

    const handleItemClick = useCallback((id: string | number) => {
        if (onItemClick) {
            onItemClick(id);
        } else {
            if (id === activeItemId && isSidebarOpen) {
                setIsSidebarOpen(false);
            } else {
                setActiveItemId(id);
                if (!isSidebarOpen || id !== activeItemId) {
                    setIsSidebarOpen(true);
                }
            }
        }
    }, [activeItemId, isSidebarOpen, onItemClick]);

    const handleCloseSidebar = useCallback(() => {
        if (onCloseSidebar) {
            onCloseSidebar();
        } else {
            setIsSidebarOpen(false);
        }
    }, [onCloseSidebar]);

    const handleMouseDownOnResizeHandle = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsResizing(true);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!layoutRef.current) return;
        const layoutRect = layoutRef.current.getBoundingClientRect();
        const newWidthRaw = e.clientX - layoutRect.left - (typeof activityBarWidth === 'number' ? activityBarWidth : 60);
        const newWidth = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, newWidthRaw));
        setCurrentSidebarWidth(newWidth);

    }, [activityBarWidth, minSidebarWidth, maxSidebarWidth]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    return (
        <Box
            ref={layoutRef}
            sx={{
                display: 'flex',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden',
                userSelect: isResizing ? 'none' : 'auto',
            }}
        >
            <ActivityBar
                items={items}
                activeItemId={activeItemId}
                onItemClick={handleItemClick}
                width={activityBarWidth}
                backgroundColor={backgroundColor}
            />

            {isSidebarOpen && activeItem && (
                <SidebarPanel
                    item={activeItem}
                    isOpen={true}
                    onClose={handleCloseSidebar}
                    width={currentSidebarWidth}
                />
            )}

            {isSidebarOpen && activeItem && (
                <ResizeHandle onMouseDown={handleMouseDownOnResizeHandle}/>
            )}


            <Box
                component="main"
                sx={{
                    marginLeft: 4,
                    flexGrow: 1,
                    overflow: 'auto',
                    height: '100vh',
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default SideNavigationLayout;
