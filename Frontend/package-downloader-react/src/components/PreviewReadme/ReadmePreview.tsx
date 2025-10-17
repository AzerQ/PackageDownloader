import React from 'react';

import {Box, Typography, LinearProgress, Alert, Button} from '@mui/material';
import {Download} from "@mui/icons-material";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { observer } from 'mobx-react-lite';
import { packageInfoStore } from '../../stores/PackageInfoStore.ts';


const PreviewReadme: React.FC = observer(() => {

    const {repositoryUrl, readmeContent} = packageInfoStore;

    if (!readmeContent)
        return <></>


    const handleDownload = (content: string) => {
        const blob = new Blob([content], {type: 'text/markdown'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const repoName = repositoryUrl?.split('/').pop()?.replace('.git', '') || 'Readme';
        a.download = `${repoName}_Readme.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return readmeContent?.case({
        fulfilled: (readmeContentValue: string) =>
            <Box sx={{width: '100%', maxWidth: 800, mx: 'auto', p: 2}}>
                <Box sx={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2}}>
                    <Typography variant="h5" gutterBottom sx={{flex: '1 1 auto', wordBreak: 'break-all'}}>
                        {repositoryUrl}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Download/>}
                        onClick={() => handleDownload(readmeContentValue)}
                        sx={{flexShrink: 0}}
                    >
                        Download
                    </Button>
                </Box>
                <MarkdownPreview source={readmeContentValue} style={{padding: 16}}/>
            </Box>,
        pending: () => <LinearProgress/>,
        rejected: (err: Error) => <Alert severity="error">Readme loading error: {err.toString()}</Alert>
    });
});

export default PreviewReadme;