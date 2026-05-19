import React from "react";
import { Box, Typography } from "@mui/material";
import { PackageDownloadAsChunksButton } from "../components/AlternativePackageDownloadButton/AlternativePackageDownloadButton";

const ChunkedDownloadPlaywrightPage: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chunked Download Test Harness
      </Typography>
      <PackageDownloadAsChunksButton
        packagesArchiveId="playwright-archive-id"
        label="Открыть настройки скачивания"
      />
    </Box>
  );
};

export default ChunkedDownloadPlaywrightPage;
