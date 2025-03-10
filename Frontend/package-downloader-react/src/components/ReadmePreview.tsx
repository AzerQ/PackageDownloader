import React from 'react';

import { Box, Typography, LinearProgress } from '@mui/material';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { observer } from 'mobx-react-lite';
import { packageInfoStore } from '../stores/PackageInfoStore';


const PreviewReadme: React.FC = observer(() => {

    const { repositoryUrl, readmeContent, isReadmeLoading } = packageInfoStore;

    return (
        <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
            <Typography variant="h5" gutterBottom>
                {repositoryUrl}
            </Typography>

            {isReadmeLoading && <LinearProgress />}

            {!isReadmeLoading && readmeContent && (
                <MarkdownPreview source={readmeContent} style={{ padding: 16 }}
                />
            )}

        </Box>
    );
});

export default PreviewReadme;