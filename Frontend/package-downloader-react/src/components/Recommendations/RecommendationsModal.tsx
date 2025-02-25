import React from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  TextField,
  Modal,
  Box,
  Typography,
  CircularProgress,
  IconButton
} from "@mui/material";
import { RecommendationsList, recommendationsStore } from "./RecommendationsList";
import { Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const RecommendationsModal: React.FC = observer(() => {

  const { t } = useTranslation();

  const handleClose = () => {
    recommendationsStore.clearUserPrompt();
    recommendationsStore.clearRecommendations();
    recommendationsStore.isRecommendationsFormEnabled = false;
  };

  // Обработчик отправки запроса на получение рекомендаций
  const handleSubmit = async () => {
    if (recommendationsStore.userPrompt.trim() === "") return; // Проверяем, что введен текст
    await recommendationsStore.getPackagesRecommendations();
  };

  // Стиль для содержимого модального окна
  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column", // Добавляем flex-direction: column для правильного расположения элементов
    maxHeight: "95vh", // Ограничиваем максимальную высоту модального окна
  };

  // Стиль для прокручиваемого контейнера
  const scrollableContentStyle = {
    flexGrow: 1, // Занимает всё доступное место
    overflowY: "auto", // Добавляем вертикальную прокрутку
    maxHeight: "300px", // Ограничиваем высоту прокручиваемого контента
  };

  return (
    <div>
      {/* Модальное окно */}
      <Modal open={recommendationsStore.isRecommendationsFormEnabled} onClose={handleClose}>
        <Box sx={modalStyle}>
          {/* Шапка модального окна с кнопкой закрытия */}
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
              <Close /> {/* Кнопка закрытия */}
            </IconButton>
          </Box>

          {/* Поле ввода для запроса пользователя */}
          <TextField
            fullWidth
            label={t("YourRequest")}
            value={recommendationsStore.userPrompt}
            onChange={(e) => recommendationsStore.setUserPrompt(e.target.value)}
            disabled={!recommendationsStore.isRecommendationsFormEnabled}
            margin="normal"
          />

          {/* Кнопка отправки запроса */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={
              !recommendationsStore.isRecommendationsFormEnabled ||
              recommendationsStore.isRecommendationsLoading
            }
            style={{ marginTop: "16px" }}
          >
            { recommendationsStore.isRecommendationsLoading ? 
            (
              <CircularProgress size={20} />
            ) :
              t("GetRecommendations")
            }
          </Button>

          {/* Прокручиваемый контейнер для списка рекомендаций */}
          <Box sx={scrollableContentStyle}>
            <RecommendationsList />
          </Box>
        </Box>
      </Modal>
    </div>
  );
});

export default RecommendationsModal;