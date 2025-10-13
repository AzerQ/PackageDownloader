import {makeAutoObservable} from "mobx";
import {githubApiClient} from "../services/githubApi";
import {fromPromise, IPromiseBasedObservable} from "mobx-utils";

export class PackageInfoStore {

    repositoryUrl: string = '';
    readmeContent?: IPromiseBasedObservable<string>;

    constructor() {
        makeAutoObservable(this);
    }

    fetchReadmeContent = async (repositoryUrl: string) => {
        if (!repositoryUrl)
            return;

        this.readmeContent = fromPromise(githubApiClient.getReadmeContent(repositoryUrl));
    }

    clearPackageInfo = () => {
        this.repositoryUrl = '';
        this.readmeContent = undefined;
    }

}

export const packageInfoStore = new PackageInfoStore();