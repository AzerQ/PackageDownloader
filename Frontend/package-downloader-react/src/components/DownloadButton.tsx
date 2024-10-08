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
      fullWidth
      sx={{ mt: 2 }}
    >
      Download Selected Packages
    </Button>
  );
};

export default DownloadButton;
