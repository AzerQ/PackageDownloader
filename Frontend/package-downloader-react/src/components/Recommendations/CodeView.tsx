import {Box, Typography} from "@mui/material";
import * as React from "react";

export interface ICodeViewProps {
    code: string
}

export const CodeView: React.FC<ICodeViewProps> = ({code}) => {
    return (
        <Box
            sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                padding: 1,
                marginTop: 1,
            }}
        >
            <Typography
                variant="body2"
                component="pre"
                style={{whiteSpace: 'pre-wrap'}}
            >
                {code}
            </Typography>
        </Box>
    );
};