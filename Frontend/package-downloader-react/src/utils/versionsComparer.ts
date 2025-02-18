export type SortOrder = 'ASC' | 'DESC';

export function compareVersions(version1: string, version2: string, sortOrder: SortOrder): number {
    // Разбиваем версии на массивы чисел
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    // Находим максимальную длину массивов для корректного сравнения
    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    // Дополняем массивы нулями, если они имеют разную длину
    const paddedV1 = v1Parts.concat(Array(maxLength - v1Parts.length).fill(0));
    const paddedV2 = v2Parts.concat(Array(maxLength - v2Parts.length).fill(0));

    // Сравниваем каждую часть версии
    for (let i = 0; i < maxLength; i++) {
        if (paddedV1[i] > paddedV2[i]) {
            return sortOrder === 'ASC' ? 1 : -1;
        } else if (paddedV1[i] < paddedV2[i]) {
            return sortOrder === 'ASC' ? -1 : 1;
        }
    }

    // Если все части равны, возвращаем 0
    return 0;
}
