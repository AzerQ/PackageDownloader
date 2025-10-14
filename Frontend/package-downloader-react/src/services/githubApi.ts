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

        const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
        const response = await axios.get<{ content: string }>(url);
        const readmeContent = atob(response.data.content);

        return readmeContent;
    }

}

export const githubApiClient: IGithubAPI = new GitHubApi();