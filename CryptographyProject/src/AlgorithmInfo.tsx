import { Typography } from "@mui/material";
import { ReactNode } from "react";

const algorithmDetails: Record<string, ReactNode> = {
    RC5: (
        <>
            <Typography paragraph>
                <strong>Type:</strong> Symmetric-key block cipher. <br />
                <strong>Inventor:</strong> Ronald Rivest. <br />
                <strong>Year of invention:</strong> 1994. <br />
                <strong>Main Features:</strong>
                <ul>
                    <li>Block size: Variable (32, 64, or 128 bits).</li>
                    <li>Key size: Up to 2040 bits.</li>
                    <li>Rounds: Up to 255.</li>
                </ul>
                <strong>Advantages:</strong>
                <ul>
                    <li>Simple and fast.</li>
                    <li>Highly configurable.</li>
                </ul>
                <strong>Limitations:</strong>
                <ul>
                    <li>Vulnerable if improperly configured.</li>
                </ul>
                More details can be found on the{" "}
                <a
                    href="https://en.wikipedia.org/wiki/RC5"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    RC5 Wikipedia page
                </a>.
            </Typography>
        </>
    ),
    RSA: (
        <>
            <Typography paragraph>
                <strong>Type:</strong> Public-key cryptosystem. <br />
                <strong>Inventors:</strong> Rivest, Shamir, and Adleman. <br />
                <strong>Year of invention:</strong> 1977. <br />
                <strong>Main Features:</strong>
                <ul>
                    <li>Relies on factoring large prime numbers.</li>
                    <li>Uses a key pair: public key and private key.</li>
                    <li>Key length: Commonly 2048 bits or more.</li>
                </ul>
                <strong>Advantages:</strong>
                <ul>
                    <li>Provides confidentiality and authentication.</li>
                    <li>Widely adopted in modern cryptography.</li>
                </ul>
                <strong>Limitations:</strong>
                <ul>
                    <li>Slower compared to symmetric algorithms.</li>
                    <li>Short keys can lead to vulnerabilities.</li>
                </ul>
                More details can be found on the{" "}
                <a
                    href="https://en.wikipedia.org/wiki/RSA_(cryptosystem)"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    RSA Wikipedia page
                </a>.
            </Typography>
        </>
    ),
};

export const getAlgorithmInfo = (algorithm: string) => {
    return algorithmDetails[algorithm] || null;
};
