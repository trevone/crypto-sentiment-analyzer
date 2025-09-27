const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let nonces = {}; // temporary storage for nonces

app.get('/nonce/:address', (req, res) => {
    const { address } = req.params;
    const nonce = Math.floor(Math.random() * 1000000).toString();
    nonces[address] = nonce;
    res.json({ nonce });
});

app.post('/verify', (req, res) => {
    const { address, signature } = req.body;
    const nonce = nonces[address];
    if (!nonce) return res.status(400).json({ error: 'No nonce found' });

    try {
        const recovered = ethers.verifyMessage(nonce, signature);
        if (recovered.toLowerCase() === address.toLowerCase()) {
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.listen(3001, () => console.log('EVM wallet server running on port 3001'));
