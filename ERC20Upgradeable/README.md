# Upgradeable ERC20

#### Deployment:
- Deploy v1
- Verify implementation contract
- Deploy v2
- Verify implementation contract
- Call initializeV2
- Grant MINTER and BKLIST roles
- Deploy v3
- Verify implementation contract
- Call initializeV3
- Grant PAUSER role

#### To run deploy type:

```
npx hardhat run scripts/deployv{VERSION}.js --network goerli
```

#### To verify type:

```
npx hardhat verify IMPLEMENTATION_ADDRESS --network goerli
```

#### my Goerli Testnet Network addresses 

- proxy: 0xd750A705b5DADb648d319f63B287F6dC845f2b89
- v1 impl: 0xEea5a10fcb64fA0a898eAEE66BdD44E81f3f578e
- v2 impl: 0xBE0f6B86a56CF1E168C87080cF3F9fDcEA83810f
- v3 impl: 0x4A43022c1EE6FC207CCbB46A5E3c1dC5aD557CE4