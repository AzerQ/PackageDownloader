import axios from "axios";

export interface IGithubAPI {
    getReadmeContent(repoUrl: string): Promise<string>
}

export class GitHubApi implements IGithubAPI {

    getReadmeContent = async (repoUrl: string): Promise<string> => {

        const clearRepoUrl = repoUrl?.replace(".git", "");

        const match = clearRepoUrl.match(/https:\/\/github\.com\/([^/]+)\/([^/]+)/);

        
        if (!match)
            throw new Error('Invalid GitHub repository URL');


        const owner = match[1];
        const repo = match[2];

        const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
        const response = await axios.get<{ content: string }>(url);
        const readmeContent = base64Unicode.Decode(response.data.content);

        return readmeContent;
    }

}

const base64Unicode = {
    Encode(str: string) {
        // first we use encodeURIComponent to get percent-encoded UTF-8,
        // then we convert the percent encodings into raw bytes which
        // can be fed into btoa.
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
            function toSolidBytes(_match: string, p1: string) {
                return String.fromCharCode(('0x' + p1) as unknown as number);
            }));
    },

    Decode(str: string) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }
}

export const githubApiClient: IGithubAPI = new GitHubApi();