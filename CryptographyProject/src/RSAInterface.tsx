import {
    Box,
    Typography,
    Alert
} from "@mui/material";

function RSAInterface() {


    return (
        <Box
            maxWidth="md"
            sx={{
                borderRadius: 2,
                p: 3,
            }}
        >
            <Alert severity="info">
                <Typography variant="body1">
                    This algorithm is not implemented yet.
                </Typography>
            </Alert>
        </Box>
    );
}

export default RSAInterface;