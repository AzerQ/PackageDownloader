const FileDescriptionHeaderName = 'content-disposition';
const FileNameParam = 'filename';

function getFirstValue(key: string, header: string | undefined): string {
    let result = '';
    if (header) {
        let headerParts = header.split(';');
        for (let part of headerParts) {
            let [_key, _value] = part.split('=').map(item => item.trim());
            if (_key === key) {
                result = _value;
                break;
            }
        }
    }
    return result;
}

function getDownloadedFileName(responseHeaders: Headers): string {
    return getFirstValue(FileNameParam, responseHeaders.get(FileDescriptionHeaderName) ?? '')
}

export async function downloadFile(serverResponse: Response): Promise<void>{
    let fileName = getDownloadedFileName(serverResponse.headers);
    let blob = await serverResponse.blob();
    var link=document.createElement('a');
    link.href=window.URL.createObjectURL(blob);
    link.download=fileName;
    link.click();
}