import { useState } from "react";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme,
    SelectChangeEvent
} from "@mui/material";
import RC5Interface from "./RC5Interface";
import RSAInterface from "./RSAInterface";

function CryptoInterface() {
    const [algorithm, setAlgorithm] = useState("RC5");
    const theme = useTheme();

    const handleAlgorithmChange = (e: SelectChangeEvent) =>
        setAlgorithm(e.target.value as string);

    return (
        <Box
            maxWidth="md"
            sx={{
                mt: -6,
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                p: 3,
            }}
        >
            <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4 }}
                gutterBottom
            >
                Encryption/Decryption Interface
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="algorithm-label">Algorithm</InputLabel>
                <Select
                    labelId="algorithm-label"
                    id="algorithm-select"
                    value={algorithm}
                    label="Algorithm"
                    onChange={handleAlgorithmChange}
                >
                    <MenuItem value="RC5">RC5</MenuItem>
                    <MenuItem value="RSA">RSA</MenuItem>
                </Select>
            </FormControl>

            {algorithm === "RC5" && <RC5Interface />}
            {algorithm === "RSA" && <RSAInterface />}
        </Box>
    );
}

export default CryptoInterface;
