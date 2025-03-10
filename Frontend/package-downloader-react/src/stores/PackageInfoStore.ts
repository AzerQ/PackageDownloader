import { makeAutoObservable, runInAction } from "mobx";
import { githubApiClient } from "../services/githubApi";
import { notificationStore } from "./NotificationStore";

export class PackageInfoStore {

    repositoryUrl: string = '';
    readmeContent: string = '';
    isReadmeLoading: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }


    fetchReadmeContent = async (repositoryUrl: string) => {

        if (!repositoryUrl)
            return;

        try {
            this.isReadmeLoading = true;
            const readmeContent = await githubApiClient.getReadmeContent(repositoryUrl);
            console.log(readmeContent);
            
            runInAction(() => {
                this.repositoryUrl = repositoryUrl
                this.readmeContent = readmeContent;
                this.isReadmeLoading = false;
            });
        }

        catch (error) {
            this.isReadmeLoading = false;
            notificationStore.addError(`Error while loading package readme: ${error}`);
        }
    };

    clearPackageInfo = () => {
        this.repositoryUrl = '';
        this.readmeContent = '';
    }

}

export const packageInfoStore = new PackageInfoStore();