import React from 'react';
import { Button } from '@mui/material';

interface DownloadButtonProps {
  onDownload: () => void;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ onDownload }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onDownload}
      sx={{ mt: 2, mb: 2 }}
    >
      Generate packages archive
    </Button>
  );
};

export default DownloadButton;
