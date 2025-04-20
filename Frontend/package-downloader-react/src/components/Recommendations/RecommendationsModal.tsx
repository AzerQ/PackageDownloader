import React from "react";
import {observer} from "mobx-react-lite";
import {
    Button,
    TextField,
    Modal,
    Box,
    Typography,
    CircularProgress,
    IconButton
} from "@mui/material";
import {Close} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import {recommendationsStore} from "../../stores/RecommendationsStore";
import RecommendationsList from "./RecommendationsList.tsx";

const RecommendationsModal: React.FC = observer(() => {

    const {t} = useTranslation();

    const {
        isRecommendationsLoading,
        isRecommendationsFormEnabled,
        packagesRecommendations,
        userPrompt,
        setUserPrompt,
        clearUserPrompt,
        clearRecommendations,
        getPackagesRecommendations
    } = recommendationsStore;

    const handleClose = () => {
        clearUserPrompt();
        clearRecommendations();
        recommendationsStore.isRecommendationsFormEnabled = false;
    };

    const handleSubmit = async () => {
        if (userPrompt.trim() === "") return;
        await getPackagesRecommendations();
    };

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
        display: "flex",
        flexDirection: "column",
        maxHeight: "95vh",
    };


    const scrollableContentStyle = {
        flexGrow: 1,
        overflowY: "auto",
        maxHeight: "300px",
    };


    return (
        <Modal open={isRecommendationsFormEnabled} onClose={handleClose}>
            <Box sx={modalStyle}>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 2,
                    }}
                >
                    <Typography variant="h6">{t("RecommendationsRequestLabel")}</Typography>
                    <IconButton onClick={handleClose} aria-label="close">
                        <Close/>
                    </IconButton>
                </Box>


                <TextField
                    fullWidth
                    label={t("YourRequest")}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    disabled={!isRecommendationsFormEnabled}
                    margin="normal"
                />


                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={
                        !isRecommendationsFormEnabled || isRecommendationsLoading
                    }
                    style={{marginTop: "16px"}}
                >
                    {isRecommendationsLoading ?
                        (
                            <CircularProgress size={20}/>
                        ) :
                        t("GetRecommendations")
                    }
                </Button>


                <Box sx={scrollableContentStyle}>
                    <RecommendationsList isRecommendationsLoading={isRecommendationsLoading}
                                         packagesRecommendations={packagesRecommendations}/>
                </Box>
            </Box>
        </Modal>
    );
});

export default RecommendationsModal;