import {ChangeEvent, useState} from "react";
import {
    Alert,
    Box,
    Button,
    FormControl,
    IconButton,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {Buffer} from "buffer";

function RC5Interface() {
    const [operation, setOperation] = useState("encrypt");
    const [text, setText] = useState("");
    const [key, setKey] = useState("");
    const [wValue, setWValue] = useState("32");
    const [rValue, setRValue] = useState("12");
    const [result, setResult] = useState("");
    const [format, setFormat] = useState("hex");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFormatSelector, setShowFormatSelector] = useState(true);
    const [copySuccess, setCopySuccess] = useState("");
    const theme = useTheme();
    let begin = false;
    let changedText = "";

    const handleOperationChange = (e: ChangeEvent<HTMLInputElement>) => {
        setOperation(e.target.value);
    };

    const isBase64 = (str: string): boolean => {
        const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
        return base64Regex.test(str);
    };

    const isHex = (str: string): boolean => {
        const hexRegex = /^[0-9A-Fa-f]+$/;
        return hexRegex.test(str);
    };

    const handleTextChange = (e: ChangeEvent<HTMLInputElement>) =>
        setText(e.target.value);
    const handleKeyChange = (e: ChangeEvent<HTMLInputElement>) =>
        setKey(e.target.value);
    const handleWChange = (e: SelectChangeEvent) =>
        setWValue(e.target.value as string);
    const handleRChange = (e: ChangeEvent<HTMLInputElement>) =>
        setRValue(e.target.value);
    const handleFormatChange = (e: SelectChangeEvent) => {
        const newFormat = e.target.value;
        if (result) {
            try {
                if (newFormat === "base64" && format === "hex") {
                    const hexBuffer = Buffer.from(result, "hex");
                    setResult(hexBuffer.toString("base64"));
                } else if (newFormat === "hex" && format === "base64") {
                    const base64Buffer = Buffer.from(result, "base64");
                    setResult(base64Buffer.toString("hex").toUpperCase());
                }
                setFormat(newFormat);
            } catch {
                setError("Failed to convert result format.");
            }
        }
    };

    const validateInputs = () => {
        const keyLengthInBits = key.length * 8;
        if (rValue === "") {
            setError("R value must be numeric.");
            return false;
        }

        if (text === "") {
            setError("Text value is required.");
            return false;
        }

        if (key === "") {
            setError("Key value is required.");
            return false;
        }

        if (keyLengthInBits > 2040) {
            setError("Key length exceeds 2040 bits.");
            return false;
        }
        if (!["16", "32", "64"].includes(wValue)) {
            setError("Invalid word size. Only 16, 32, and 64 are allowed.");
            return false;
        }

        const rValueNum = parseInt(rValue, 10);
        if (rValueNum < 0 || rValueNum > 255) {
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
        const apiUrl = import.meta.env.VITE_API_URL;
        if(operation === "decrypt")
        {
            begin = true;
        }

        if (operation === "decrypt" && isBase64(text) && !isHex(text)) {
            changedText = Buffer.from(text, "base64").toString("hex");
        } else {
            changedText = text;
        }

        setLoading(true);
        setError("");
        setResult("");

        try {
            const endpoint =
                operation === "encrypt"
                    ? `${apiUrl}/api/EncryptionDecryption/Encrypt`
                    : `${apiUrl}/api/EncryptionDecryption/Decrypt`;

            const bodyData = {
                w: parseInt(wValue, 10),
                r: parseInt(rValue, 10),
                text: changedText,
                key,
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });
            const responseText = await response.text();

            if (!response.ok) {
                const cleanMessage = responseText.replace(/^Eroare:\s*/, "");
                setError(`${cleanMessage}`);
                console.error("Error Details:", cleanMessage);
                return;
            }

            if (operation === "decrypt" && !begin) {
                setShowFormatSelector(true);
            }

            if (operation === "encrypt" && !begin) {
                setShowFormatSelector(true);
            }

            if (operation === "decrypt" && begin) {
                setShowFormatSelector(false);
            }

            const data = JSON.parse(responseText);
            if (data.result) {
                setResult(data.result);
                setFormat("hex");
            } else {
                setResult("Could not find 'result' in the server response.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const textLabel = operation === "encrypt" ? "Plaintext" : "Ciphertext";

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setCopySuccess("Copied!");
        setTimeout(() => setCopySuccess(""), 2000);
    };

    return (
        <Box
            maxWidth="md"
            sx={{
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
                p: 3,
            }}
        >
            <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 3 }}
                gutterBottom
            >
                RC5 Encryption/Decryption
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
                <RadioGroup
                    row
                    value={operation}
                    onChange={handleOperationChange}
                >
                    <FormControlLabel
                        value="encrypt"
                        control={<Radio />}
                        label="Encrypt"
                        slotProps={{
                            typography: { color: "text.secondary" },
                        }}
                    />
                    <FormControlLabel
                        value="decrypt"
                        control={<Radio />}
                        label="Decrypt"
                        slotProps={{
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
                <Alert severity="info" sx={{fontWeight: "bold", fontSize: "1rem", position: "relative"}}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                mt: -0.3,
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
                        <IconButton
                            size="small"
                            onClick={handleCopy}
                            sx={{ position: "absolute", top: 8, right: 8 }}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                        {copySuccess && (
                            <Typography
                                variant="body2"
                                color="success.main"
                                sx={{
                                    position: "absolute",
                                    top: 10,
                                    right: 40,
                                    padding: "2px 4px",
                                    borderRadius: "4px"
                                }}
                            >
                                {copySuccess}
                            </Typography>
                        )}
                        {showFormatSelector && (
                            <FormControl sx={{ mt: 2 }}>
                                <InputLabel id="format-label">Format</InputLabel>
                                <Select
                                    labelId="format-label"
                                    value={format}
                                    onChange={handleFormatChange}
                                    label="Format"
                                >
                                    <MenuItem value="hex">Hex</MenuItem>
                                    <MenuItem value="base64">Base64</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                    </Box>
                </Alert>
            )}
        </Box>
    );
}

export default RC5Interface;
