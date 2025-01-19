import { useState } from "react";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    useTheme,
    SelectChangeEvent,
    DialogTitle,
    DialogContent,
    Dialog,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import RC5Interface from "./RC5Interface";
import RSAInterface from "./RSAInterface";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { getAlgorithmInfo } from "./AlgorithmInfo.tsx";

function CryptoInterface() {
    const [algorithm, setAlgorithm] = useState("RC5");
    const [infoOpen, setInfoOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);
    const theme = useTheme();

    const handleAlgorithmChange = (e: SelectChangeEvent) =>
        setAlgorithm(e.target.value as string);

    const handleInfoClick = () => {
        setInfoOpen(true);
    };

    const handleInfoClose = () => {
        setInfoOpen(false);
    };

    const handleHelpClick = () => {
        setHelpOpen(true);
    };

    const handleHelpClose = () => {
        setHelpOpen(false);
    };

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
            <IconButton
                onClick={handleInfoClick}
                sx={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    color: theme.palette.text.secondary,
                }}
            >
                <Tooltip title="More info">
                    <InfoIcon />
                </Tooltip>
            </IconButton>

            <Typography
                variant="h4"
                color="text.secondary"
                sx={{ mb: 4 }}
                gutterBottom
            >
                CryptographySpace
            </Typography>

            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ position: "relative" }}
            >
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
                <Tooltip title={`More info about ${algorithm}`}>
                    <IconButton
                        onClick={handleHelpClick}
                        sx={{
                            position: "absolute",
                            right: '-33px',
                            top: "65%",
                            transform: "translateY(-50%)",
                        }}
                    >
                        <HelpOutlineIcon sx={{ height: "20px" }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {algorithm === "RC5" && <RC5Interface />}
            {algorithm === "RSA" && <RSAInterface />}

            <Dialog open={infoOpen} onClose={handleInfoClose}>
                <DialogTitle>
                    About This Application
                    <IconButton
                        aria-label="close"
                        onClick={handleInfoClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        This application allows you to perform encryption and decryption using
                        different algorithms. To get started:
                    </Typography>
                    <ul>
                        <li>Select an algorithm from the dropdown menu.</li>
                        <li>Follow the interface prompts for encryption or decryption.</li>
                        <li>Each algorithm has specific parameters you can adjust.</li>
                    </ul>
                    <Typography>
                        Use the <HelpOutlineIcon sx={{ verticalAlign: "middle" }} /> icon for
                        additional help about each algorithm.
                    </Typography>
                </DialogContent>
            </Dialog>

            <Dialog open={helpOpen} onClose={handleHelpClose}>
                <DialogTitle>
                    About {algorithm} Algorithm
                    <IconButton
                        aria-label="close"
                        onClick={handleHelpClose}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            color: theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>{getAlgorithmInfo(algorithm)}</DialogContent>
            </Dialog>
        </Box>
    );
}

export default CryptoInterface;
