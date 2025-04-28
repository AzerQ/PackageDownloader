import React from "react";
import {observer} from "mobx-react-lite";
import {
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress
} from "@mui/material";
import {useTranslation} from "react-i18next";
import {recommendationsStore} from "../../stores/RecommendationsStore";
import RecommendationsList from "./RecommendationsList.tsx";

const AIRecommendations: React.FC = observer(() => {

    const {t} = useTranslation();

    const {
        isRecommendationsLoading,
        packagesRecommendations,
        userPrompt,
        setUserPrompt,
        getPackagesRecommendations
    } = recommendationsStore;



    const handleSubmit = async () => {
        if (userPrompt.trim() === "") return;
        await getPackagesRecommendations();
    };


    const scrollableContentStyle = {
        flexGrow: 1,
        overflowY: "auto",
        maxHeight: "300px",
    };


    return (
            <Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 2,
                    }}
                >
                    <Typography variant="h6">{t("RecommendationsRequestLabel")}</Typography>
                </Box>


                <TextField
                    fullWidth
                    label={t("YourRequest")}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    margin="normal"
                />


                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={
                        isRecommendationsLoading
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
    );
});

export default AIRecommendations;