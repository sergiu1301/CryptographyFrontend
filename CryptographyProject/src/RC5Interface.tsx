import { ChangeEvent, useEffect, useState } from "react";
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
    CircularProgress,
    List,
    useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Buffer } from "buffer";

const CACHE_KEY_RC5 = "history_cache_rc5";
const CACHE_EXPIRATION = 48 * 60 * 60 * 1000;

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
    const [history, setHistory] = useState<
        { operation: string; w: string; r: string; text: string; key: string; result: string, timestamp: number }[]
    >([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    let begin = false;
    let changedText = "";

    const saveHistoryToCache = (newHistory: typeof history) => {
        const cacheData = {
            history: newHistory,
            timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY_RC5, JSON.stringify(cacheData));
    };

    const loadHistoryFromCache = () => {
        const cachedData = localStorage.getItem(CACHE_KEY_RC5);
        if (cachedData) {
            const { history: cachedHistory, timestamp } = JSON.parse(cachedData);
            const isExpired = Date.now() - timestamp > CACHE_EXPIRATION;

            if (!isExpired) {
                setHistory(cachedHistory);
            } else {
                localStorage.removeItem(CACHE_KEY_RC5);
            }
        }
    };

    useEffect(() => {
        loadHistoryFromCache();
    }, []);

    const addToHistory = (newEntry: typeof history[0]) => {
        setHistory((prevHistory) => {
            const updatedHistory = [newEntry, ...prevHistory].slice(0, 30);
            saveHistoryToCache(updatedHistory);
            return updatedHistory;
        });
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

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

            const newEntry = {
                operation: operation,
                w: wValue,
                r: rValue,
                text: changedText,
                key: key,
                result: data.result,
                timestamp: Date.now()
            };

            addToHistory(newEntry);
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
            sx={{
                display: "flex",
                position: "relative",
                height: "100vh",
            }}
        >
            {drawerOpen && (
                <Box
                    onClick={() => setDrawerOpen(false)}
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 1200,
                    }}
                />
            )}

            {/* History */}
            <Box
                sx={{
                    position: "fixed",
                    left: drawerOpen ? 0 : "-300px",
                    top: 0,
                    height: "100%",
                    width: "300px",
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    boxShadow: drawerOpen ? "0px 0px 10px rgba(0,0,0,0.3)" : "none",
                    transition: "left 0.3s ease-in-out",
                    overflowY: "auto",
                    zIndex: 1201
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 2,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                        backgroundColor: theme.palette.background.default,
                    }}
                >
                    <Typography variant="h6">History</Typography>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Box>
                <List sx={{
                    padding: 2,
                    gap: 2,
                    display: "flex",
                    flexDirection: "column",
                }}>
                    {history.length > 0 ? history.map((entry, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: "8px",
                                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                                padding: 2,
                                transition: "transform 0.2s, box-shadow 0.2s",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                                    backgroundColor: theme.palette.action.hover
                                },
                            }}
                            onClick={() => {
                                setText(entry.text);
                                setKey(entry.key);
                                setWValue(entry.w);
                                setRValue(entry.r);
                                setOperation(entry.operation);
                                setDrawerOpen(false);
                                setResult("");
                            }}
                        >
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary.main"
                                sx={{
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                    paddingBottom: 1,
                                    marginBottom: 1,
                                }}
                            >
                                {entry.operation.toUpperCase()}
                            </Typography>

                            {/* Details */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    <strong>w:</strong> {entry.w}, <strong>r:</strong> {entry.r}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <strong>{operation === "encrypt" ? "Plaintext" : "Ciphertext"}:</strong>{" "}
                                    {entry.text}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <strong>Key:</strong> {entry.key}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.primary"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    <strong>Result:</strong> {entry.result}
                                </Typography>
                            </Box>

                            {/* Timestamp */}
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    alignSelf: "flex-end",
                                    marginTop: 1,
                                    fontStyle: "italic",
                                }}
                            >
                                {new Date(entry.timestamp).toLocaleString()}
                            </Typography>
                        </Box>
                    )) : (<Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            textAlign: "center",
                            gap: 1,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                color: "text.secondary",
                                fontWeight: "bold",
                            }}
                        >
                            Nothing to show here
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: "text.secondary",
                            }}
                        >
                            Perform an action to populate this section.
                        </Typography>
                    </Box>)}
                </List>
            </Box>

            {/* Main Section */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    padding: 3,
                    overflow: "auto"
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

                <Box sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    gap: 2,
                    mb: 2,
                    width: "100%" }}>
                    <FormControl sx={{ width: 110 }}>
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
                        sx={{
                            width: 110
                        }}
                        inputProps={{ min: 0, max: 255 }}
                    />
                </Box>

                <TextField
                    label={
                        <span
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'block',
                            }}
                        >
                            {textLabel}
                        </span>
                    }
                    multiline
                    minRows={3}
                    maxRows={5}
                    value={text}
                    onChange={handleTextChange}
                    fullWidth
                    sx={{mb: 2}}
                />

                <TextField
                    label="Key"
                    value={key}
                    onChange={handleKeyChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />

                <Box sx={{ mb: 2, display: "flex", justifyContent: "center"}}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                        onClick={handleProcess}
                        disabled={loading}
                        fullWidth
                        sx={{
                            width: "150px",
                            "&:hover": {
                                transform: "scale(1.05)",
                                transition: "transform 0.2s ease-in-out",
                            },
                        }}
                    >
                        {loading ? "Processing..." : "Start"}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!error && result && (
                    <Alert severity="info"
                           sx={{
                               fontWeight: "bold",
                               fontSize: "1rem",
                               position: "relative",
                               width: "100%"}}>
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
                                    minHeight: "30px",
                                    maxHeight: "53px",
                                    overflowY: "auto",
                                    overflowX: "hidden"
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
                                <FormControl sx={{ mt: 1 }}>
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

            {/* Toggle History Button */}
            {!drawerOpen && (<IconButton
                onClick={toggleDrawer}
                sx={{
                    position: "fixed",
                    top: "50%",
                    left: 0,
                    transform: "translateY(-50%)",
                    zIndex: 1202,
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: 5
                }}
            >
                <ChevronRightIcon />
            </IconButton>)}
        </Box>
    );
}

export default RC5Interface;
