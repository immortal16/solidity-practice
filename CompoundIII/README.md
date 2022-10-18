# Compound III Comet interaction

- Supply Protocol with WETH to get WETH collateral.
- Withdraw WETH collateral.
- Borrow base asset (USDC) with supplied collateral WETH.
- Repay borrow partial;
- Repay borrow fully;

#### To run test type:

```
npx hardhat test .\test\compoundIII.test.js
```

### Compound III calculations

- Added .xlsx document with cases for supplying different assets a collateral and calculated positive and negative interest in case of borrow base asset / supply base asset.

- Added new tests to prove calculations

#### To run test type:

```
npx hardhat test .\test\calculation.test.js
```