# Deployment Information

This directory contains deployment records for different Solana networks.

## Structure

- `devnet/` - Development network deployments
- `testnet/` - Test network deployments
- `mainnet/` - Production network deployments

## Deployment Record Format

Each deployment generates a JSON file with the following structure:

```json
{
  "network": "devnet|testnet|mainnet",
  "timestamp": "ISO timestamp",
  "deployer": "deployer public key",
  "contracts": [
    {
      "name": "ContractName",
      "address": "contract program address",
      "storageAddress": "contract storage address",
      "transactionSignature": "deployment tx signature",
      "blockTime": "block timestamp",
      "slot": "slot number"
    }
  ],
  "summary": {
    "totalContracts": 4,
    "successful": 4,
    "failed": 0,
    "gasUsed": "total gas consumed",
    "totalCost": "deployment cost in SOL"
  }
}
```

## Usage

Deployment records are automatically generated when using:

- `npm run deploy`
- `npm run deploy:devnet`
- `npm run deploy:testnet`
- `npm run deploy:mainnet`

Latest deployment info is also saved as `latest-{network}.json` for easy access.
