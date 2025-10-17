import { PackageDetails } from "./apiClient";

export interface DownloadHistoryItem {
    timestamp: number;
    packages: PackageDetails[];
    packageType: string;
}

const STORAGE_KEY = 'package_download_history';
const MAX_HISTORY_ITEMS = 50;

export class DownloadHistoryService {
    getHistory(): DownloadHistoryItem[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];
            return JSON.parse(data) as DownloadHistoryItem[];
        } catch (error) {
            console.error('Error reading download history:', error);
            return [];
        }
    }

    addToHistory(item: Omit<DownloadHistoryItem, 'timestamp'>): void {
        try {
            const history = this.getHistory();
            const newItem: DownloadHistoryItem = {
                ...item,
                timestamp: Date.now()
            };
            
            // Add to beginning of array
            history.unshift(newItem);
            
            // Keep only the last MAX_HISTORY_ITEMS
            const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
        } catch (error) {
            console.error('Error saving download history:', error);
        }
    }

    clearHistory(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing download history:', error);
        }
    }

    removeHistoryItem(timestamp: number): void {
        try {
            const history = this.getHistory();
            const filtered = history.filter(item => item.timestamp !== timestamp);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Error removing history item:', error);
        }
    }
}

export const downloadHistoryService = new DownloadHistoryService();
