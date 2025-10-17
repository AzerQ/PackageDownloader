import React from 'react';
import {
    Button
} from '@mui/material';
import {observer} from 'mobx-react-lite';
import {FileDownload} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';
import {cartStore} from "../../stores/CartStore.ts";


const DownloadPackagesButton: React.FC = observer(() => {

    const {t} = useTranslation();

    const {getPackagesDownloadLink} = cartStore;

    return (
        <>
            <Button
                startIcon={<FileDownload/>}
                variant="contained"
                color="primary"
                onClick={getPackagesDownloadLink}
                sx={{mr: 1}}
                data-testid="download-button"
            >
                {t("Download")}
            </Button>
        </>
    );
});

export default DownloadPackagesButton;