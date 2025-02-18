import { makeAutoObservable, runInAction } from "mobx";
import { packageApiClient, PackageRecommendation } from "../services/apiClient";
import { packagesSearchStore } from "./PackagesStore";

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

        let repositoryType = packagesSearchStore.repositoryType;

        try {
            this.isRecommendationsLoading = true;
            const results = await packageApiClient.getRecommendations(repositoryType, this.userPrompt);

            runInAction(() => {
                this.packagesRecommendations = results;
                this.isRecommendationsLoading = false;
            });

        }
        catch (error) {
            this.isRecommendationsLoading = false;
            console.log(`User prompt: ` + this.userPrompt);
            console.error(`Error fetching recommendations`, error);
        }

    }

    clearRecommendations = () => this.packagesRecommendations = [];

    openRecommendationsForm = () => this.isRecommendationsFormEnabled = true;

    closeRecommendationsForm = () => {
         this.isRecommendationsFormEnabled = false;
         this.clearRecommendations();
         this.clearUserPrompt();
    }
}

export const recommendationsStore = new RecommendationsStore(); 