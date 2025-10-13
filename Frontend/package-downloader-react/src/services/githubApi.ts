import axios from "axios";

export interface IGithubAPI {
    getReadmeContent(repoUrl: string): Promise<string>
}

export class GitHubApi implements IGithubAPI {

    getReadmeContent = async (repoUrl: string): Promise<string> => {


        const match = repoUrl.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);

        
        if (!match)
            throw new Error('Invalid GitHub repository URL');


        const owner = match[1];
        const repo = match[2];
        const branch = 'main';

        const readmeNameVariants = ['README.md', 'Readme.md', 'readme.md'];
        const urlLinksVariants = readmeNameVariants.map( variant => `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${variant}`);
        urlLinksVariants.push(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`)

        const response = await Promise.any(urlLinksVariants.map(link => axios.get(link)));

        return response.data;
    }

}

export const githubApiClient: IGithubAPI = new GitHubApi();