import React from 'react';

import {Box, Typography, LinearProgress, Alert} from '@mui/material';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { observer } from 'mobx-react-lite';
import { packageInfoStore } from '../../stores/PackageInfoStore.ts';


const PreviewReadme: React.FC = observer(() => {

    const {repositoryUrl, readmeContent} = packageInfoStore;

    if (!readmeContent)
        return <></>


    return readmeContent?.case({
        fulfilled: readmeContent =>
            <Box sx={{width: '100%', maxWidth: 800, mx: 'auto', p: 2}}>
                <Typography variant="h5" gutterBottom>
                    {repositoryUrl}
                </Typography>
                <MarkdownPreview source={readmeContent} style={{padding: 16}}/>
            </Box>,
        pending: () => <LinearProgress/>,
        rejected: err => <Alert severity="error">Readme loading error: {err.toString()}</Alert>

    });
});

export default PreviewReadme;