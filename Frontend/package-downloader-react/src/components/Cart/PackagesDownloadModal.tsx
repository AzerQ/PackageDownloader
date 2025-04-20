import {cartStore} from "../../stores/CartStore.ts";
import {Alert, AlertTitle, Box, Button, LinearProgress, Link, Modal, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";
import {observer} from "mobx-react-lite";

export const PackagesDownloadModal: React.FC = observer(() => {

    const handleClose = () => {
        cartStore.packagesDownloadLink = undefined;
    };

    const {packagesDownloadLink} = cartStore;

    if (!packagesDownloadLink)
        return <></>

    const {t} = useTranslation();

    const InnerContent = packagesDownloadLink.case({

        pending: () =>
            <>
                <Typography variant="h6" gutterBottom>
                    {t("PreparingPackages")}
                </Typography>
                <LinearProgress color="secondary"/>
            </>,

        rejected: (err) =>
            <Alert severity="error">
                <AlertTitle>{t("Error")}</AlertTitle>
                {err}
            </Alert>,

        fulfilled: (value) =>
            <>
                <img
                    src="https://img.icons8.com/color/96/000000/checkmark.png"
                    alt="Success"
                    style={{width: '80px', height: '80px', marginBottom: '16px'}}
                />
                <Typography variant="h6" gutterBottom>
                    {t("PackagesLinkCreated")}
                </Typography>

                <Link href={value}>{t("DownloadPackages")}</Link>
            </>
    });



    return (
        <Modal open={Boolean(packagesDownloadLink)} onClose={handleClose}>
            <Box
                sx={{
                    position: 'absolute' as const,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    textAlign: 'center',
                }}
            >
                {InnerContent}
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleClose}
                    sx={{mt: 2, ml: 2}}
                >
                    {t("Close")}
                </Button>
            </Box>
        </Modal>
    );
});