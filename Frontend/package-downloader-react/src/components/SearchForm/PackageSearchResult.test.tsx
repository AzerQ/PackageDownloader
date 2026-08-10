import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import PackageSearchResult from './PackageSearchResult';
import {getPackageApiClient, PackageInfo, PackageType} from '../../services/apiClient';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({t: (key: string) => key}),
}));

vi.mock('../../services/apiClient', async (importOriginal) => ({
    ...await importOriginal<typeof import('../../services/apiClient')>(),
    getPackageApiClient: vi.fn(),
}));

vi.mock('../../stores/PackagesStore', () => ({
    packagesSearchStore: {repositoryType: 'Docker'},
}));

vi.mock('../../stores/PackageInfoStore', () => ({
    packageInfoStore: {fetchReadmeContent: vi.fn()},
}));

vi.mock('../../stores/NotificationStore', () => ({
    notificationStore: {addError: vi.fn()},
}));

describe('PackageSearchResult version selector', () => {
    const getPackageVersions = vi.fn();
    const packageInfo = Object.assign(new PackageInfo(), {
        id: 'postgres',
        currentVersion: '17.5',
        otherVersions: ['16.9'],
        description: 'PostgreSQL',
        tags: [],
        authorInfo: 'PostgreSQL Global Development Group',
        repositoryUrl: null,
        iconUrl: null,
        packageUrl: null,
        downloadsCount: 100,
        isAddedInCart: false,
        defaultIcon: '/icons/box.svg',
        getPackageIconOrStockImage: () => '/icons/box.svg',
    });

    beforeEach(() => {
        vi.clearAllMocks();
        getPackageVersions.mockResolvedValue([
            {versionTag: '17.5', releaseDate: null},
            {versionTag: '16.9', releaseDate: null},
        ]);
        vi.mocked(getPackageApiClient).mockResolvedValue({
            getPackageVersions,
        } as unknown as Awaited<ReturnType<typeof getPackageApiClient>>);
    });

    it('loads the expanded version list only when the selector is opened', async () => {
        const user = userEvent.setup();
        render(<PackageSearchResult packageInfo={packageInfo}/>);

        expect(getPackageVersions).not.toHaveBeenCalled();
        expect(screen.getByRole('combobox')).toHaveTextContent('17.5');

        await user.click(screen.getByRole('combobox'));

        expect(await screen.findByRole('option', {name: '16.9'})).toBeInTheDocument();
        expect(getPackageVersions).toHaveBeenCalledWith(PackageType.Docker, 'postgres');

        await user.keyboard('{Escape}');
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
        await user.click(screen.getByRole('combobox'));

        expect(getPackageVersions).toHaveBeenCalledTimes(1);
    });
});
