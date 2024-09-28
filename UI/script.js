const form = document.getElementById('downloadForm');
const loading = document.getElementById('loading');
const error = document.getElementById('error');


function collectPackageRequestData() {
    // Сбор данных из формы
    const packageQuery = {
        PackageType: document.querySelector('#packageType').value,
        PackageID: document.getElementById('packageId').value,
    }
    let packageVersion = document.getElementById('packageVersion').value;
    let sdkVersion = document.getElementById('sdkVersion').value;

    if (packageVersion)
        packageQuery["PackageVersion"] = packageVersion;

    if (sdkVersion)
        packageQuery["SdkVersion"] = sdkVersion;

    return packageQuery;
}

function getFirstValue(key, header) {
    let headerParts = header.split(';');
    for (let part of headerParts) {
        let [_key,_value] = part.split('=').map(item=>item.trim());
        if (_key === key)
            return _value;
    }
}

async function downloadFile(fetchResult) {        
    var filename = getFirstValue('filename', fetchResult.headers.get('content-disposition'));
    var data = await fetchResult.blob();
    // It is necessary to create a new blob object with mime-type explicitly set
    // otherwise only Chrome works like it should
    const blob = new Blob([data], { type: data.type || 'application/octet-stream' });
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE doesn't allow using a blob object directly as link href.
        // Workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
        return;
    }
    // Other browsers
    // Create a link pointing to the ObjectURL containing the blob
    const blobURL = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.style.display = 'none';
    tempLink.href = blobURL;
    tempLink.setAttribute('download', filename);
    // Safari thinks _blank anchor are pop ups. We only want to set _blank
    // target if the browser does not support the HTML5 download attribute.
    // This allows you to download files in desktop safari if pop up blocking
    // is enabled.
    if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank');
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(blobURL);
    }, 100);
}

async function downloadPackageWithDependencies(packageRequest) {
    const queryString = new URLSearchParams(packageRequest);
    const response = await fetch(`/api/Packages?${queryString}`);

    if (!response.ok) {
        throw new Error('Ошибка при загрузке пакета');
    }
    downloadFile(response);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Отправка запроса на ваш сервер (замените URL на ваш)
    try {
        loading.style.display = 'block';
        let packageRequest = collectPackageRequestData();
        downloadPackageWithDependencies(packageRequest);
    } catch (error) {
        error.style.display = 'block';
        error.textContent = error.message;
    } finally {
        loading.style.display = 'none';
    }
});