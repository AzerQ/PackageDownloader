import { makeAutoObservable } from "mobx";
import { AdditionalPanel } from "../components/SideNavigationLayout/PanelsContext/additionalPanel";

export class SideNavigationStore {
    activePanel: AdditionalPanel | null = null;
    isSidebarOpen: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    openPanel = (panel: AdditionalPanel) => {
        this.activePanel = panel;
        this.isSidebarOpen = true;
    };

    closePanel = () => {
        this.isSidebarOpen = false;
    };

    togglePanel = (panel: AdditionalPanel) => {
        if (this.activePanel === panel && this.isSidebarOpen) {
            this.closePanel();
        } else {
            this.openPanel(panel);
        }
    };
}

export const sideNavigationStore = new SideNavigationStore();
