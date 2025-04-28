import { makeAutoObservable, runInAction } from "mobx";
import { getPackageApiClient, PackageRecommendation } from "../services/apiClient";
import { packagesSearchStore } from "./PackagesStore";
import { notificationStore } from "./NotificationStore";
import i18n from "../localization/i18n";

class RecommendationsStore {

    packagesRecommendations: PackageRecommendation[] = [];
    userPrompt: string = '';
    isRecommendationsLoading: boolean = false;
    isRecommendationsFormEnabled: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setUserPrompt = (userPrompt: string) => this.userPrompt = userPrompt;

    clearUserPrompt = () => this.userPrompt = '';

    getPackagesRecommendations = async () => {

        const repositoryType = packagesSearchStore.repositoryType;

        try {
            const packageApiClient = await getPackageApiClient();
            this.isRecommendationsLoading = true;
            const results = await packageApiClient.getRecommendations(repositoryType, this.userPrompt, i18n.language);

            runInAction(() => {
                this.packagesRecommendations = results;
                this.isRecommendationsLoading = false;
            });

        }
        catch (error) {
            this.isRecommendationsLoading = false;
             notificationStore.addError(`Error fetching recommendations ${error}`);
        }

    }

    clearRecommendations = () => this.packagesRecommendations = [];

    openRecommendationsForm = () => this.isRecommendationsFormEnabled = true;

}

export const recommendationsStore = new RecommendationsStore(); 