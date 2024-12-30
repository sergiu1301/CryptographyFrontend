import { useState } from "react";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Button,
    Alert,
    useTheme,
} from "@mui/material";

function CryptoInterface() {
    const [algorithm, setAlgorithm] = useState("RC5");
    const [operation, setOperation] = useState("encrypt");
    const [text, setText] = useState("");
    const [key, setKey] = useState("");
    const [wValue, setWValue] = useState("32");
    const [rValue, setRValue] = useState("12");

    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const theme = useTheme();

    const handleAlgorithmChange = (e) => setAlgorithm(e.target.value);
    const handleOperationChange = (e) => setOperation(e.target.value);
    const handleTextChange = (e) => setText(e.target.value);
    const handleKeyChange = (e) => setKey(e.target.value);
    const handleWChange = (e) => setWValue(e.target.value);
    const handleRChange = (e) => setRValue(e.target.value);

    const validateInputs = () => {
        const keyLengthInBits = key.length * 8; // Each character is 1 byte = 8 bits
        if (keyLengthInBits > 2040) {
            setError("Key length exceeds 2040 bits.");
            return false;
        }
        if (!["16", "32", "64"].includes(wValue)) {
            setError("Invalid word size. Only 16, 32, and 64 are allowed.");
            return false;
        }
        if (rValue < 0 || rValue > 255) {
            setError("Invalid number of rounds. Must be between 0 and 255.");
            return false;
        }

        if (keyLengthInBits < parseInt(wValue, 10)) {
            setError(
                `The key size in bits (${keyLengthInBits}) must be greater than or equal to W (${wValue}).`
            );
            return false;
        }
        return true;
    };

    const handleProcess = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError("");
        setResult("");

        try {
            const endpoint =
                operation === "encrypt"
                    ? "https://localhost:7258/api/EncryptionDecryption/Encrypt"
                    : "https://localhost:7258/api/EncryptionDecryption/Decrypt";

            const bodyData = {
                w: parseInt(wValue, 10),
                r: parseInt(rValue, 10),
                text,
                key,
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.result) {
                setResult(data.result);
            } else {
                setResult("Could not find 'result' in the server response.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "An error occurred while communicating with the server.");
        } finally {
            setLoading(false);
        }
    };

    const textLabel = operation === "encrypt" ? "Plaintext" : "Ciphertext";

    return (
        <Box
            maxWidth="md"
            sx={{
                mt: 4,
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
                    <MenuItem value="AES">AES</MenuItem>
                    <MenuItem value="RSA">RSA</MenuItem>
                </Select>
            </FormControl>

            {algorithm === "RC5" ? (
                <>
                    <FormControl component="fieldset" sx={{ mb: 2 }}>
                        <RadioGroup
                            row
                            value={operation}
                            onChange={handleOperationChange}
                            sx={{ mt: 1 }}
                        >
                            <FormControlLabel
                                value="encrypt"
                                control={<Radio />}
                                label="Encrypt"
                                componentsProps={{
                                    typography: { color: "text.secondary" },
                                }}
                            />
                            <FormControlLabel
                                value="decrypt"
                                control={<Radio />}
                                label="Decrypt"
                                componentsProps={{
                                    typography: { color: "text.secondary" },
                                }}
                            />
                        </RadioGroup>
                    </FormControl>

                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <FormControl sx={{ width: 120 }}>
                            <InputLabel id="w-label">w (word size)</InputLabel>
                            <Select
                                labelId="w-label"
                                value={wValue}
                                label="w (word size)"
                                onChange={handleWChange}
                            >
                                <MenuItem value="16">16 bits</MenuItem>
                                <MenuItem value="32">32 bits</MenuItem>
                                <MenuItem value="64">64 bits</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="r (rounds)"
                            type="number"
                            value={rValue}
                            onChange={handleRChange}
                            sx={{ width: 120 }}
                            inputProps={{ min: 0, max: 255 }}
                        />
                    </Box>

                    <TextField
                        label={textLabel}
                        multiline
                        minRows={3}
                        value={text}
                        onChange={handleTextChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        label="Key"
                        value={key}
                        onChange={handleKeyChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />

                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleProcess}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Start"}
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {!error && result && (
                        <Alert severity="info">
                            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "bold",
                                        mb: 1,
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                >
                                    Result:
                                </Typography>
                                <pre
                                    style={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-all",
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                >
                                    {result}
                                </pre>
                            </Box>
                        </Alert>
                    )}
                </>
            ) : (
                <Alert severity="info">
                    <Typography variant="body1">
                        This algorithm is not implemented yet.
                    </Typography>
                </Alert>
            )}
        </Box>
    );
}

export default CryptoInterface;
