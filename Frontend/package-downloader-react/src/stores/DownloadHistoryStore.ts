import { makeAutoObservable } from "mobx";
import { downloadHistoryService, DownloadHistoryItem } from "../services/downloadHistoryService";

export class DownloadHistoryStore {
    history: DownloadHistoryItem[] = [];

    constructor() {
        makeAutoObservable(this);
        this.loadHistory();
    }

    loadHistory = () => {
        this.history = downloadHistoryService.getHistory();
    };

    addToHistory = (item: Omit<DownloadHistoryItem, 'timestamp'>) => {
        downloadHistoryService.addToHistory(item);
        this.loadHistory();
    };

    clearHistory = () => {
        downloadHistoryService.clearHistory();
        this.history = [];
    };

    removeHistoryItem = (timestamp: number) => {
        downloadHistoryService.removeHistoryItem(timestamp);
        this.loadHistory();
    };
}

export const downloadHistoryStore = new DownloadHistoryStore();
