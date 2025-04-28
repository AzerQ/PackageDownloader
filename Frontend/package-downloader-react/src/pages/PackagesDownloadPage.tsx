import React from 'react';
import {SideNavigationItem} from "../components/SideNavigationLayout/types.ts";
import DescriptionIcon from "@mui/icons-material/Description";
import PreviewReadme from "../components/PreviewReadme/ReadmePreview.tsx";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AIRecommendations from "../components/Recommendations/AIRecommendations.tsx";
import {Container, CssBaseline, Typography} from "@mui/material";
import SideNavigationLayout from "../components/SideNavigationLayout/SideNavigationLayout.tsx";
import LanguageSwitcher from "../localization/LanguageSwitcher.tsx";
import PackageCart from "../components/Cart/PackageCart.tsx";
import NotificationBanner from "../components/Notification/Notification.tsx";
import SearchForm from "../components/SearchForm/SearchForm.tsx";
import {useTranslation} from "react-i18next";


export enum AdditionalTab {
   Readme= 'Readme',
   AI= 'AIConsultant'
};

const packageDownloaderItems: SideNavigationItem[] = [
    {
        id: AdditionalTab.Readme,
        icon: <DescriptionIcon/>,
        label: 'README',
        content: <PreviewReadme/>,
    },
    {
        id: AdditionalTab.AI,
        icon: <AutoAwesomeIcon/>,
        label: 'AI',
        content: <AIRecommendations/>
    }
];

const PackagesDownloadPage: React.FC = () => {

    const {t} = useTranslation();

    return (
        <>
            <CssBaseline/>
            <SideNavigationLayout
                items={packageDownloaderItems}
                initialSidebarOpen={true}
                activityBarWidth={50}
                sidebarWidth={500}
                minSidebarWidth={500}
                maxSidebarWidth={1300}
                backgroundColor="#3a3f4a"
            >
                <>
                    <LanguageSwitcher/>

                    <Container maxWidth="xl">
                        <Typography variant="h4" align="center" gutterBottom>
                            {t("AppTitle")}
                        </Typography>
                        <PackageCart/>
                        <NotificationBanner/>

                    </Container>

                </>
                <SearchForm/>
            </SideNavigationLayout>
        </>
    );
};

export default PackagesDownloadPage;