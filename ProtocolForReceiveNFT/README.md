# Protocol for receive NFT through a shared secret

### Abstract:

Alice wants to transfer NFT to someone who knows secret using smart-contract. Let Bob knows this secret. Bob need to proof to smart contract that he know the secret and Alice should provide some verification information about this secret.

### Steps

1. Alice deployes verifier contract;
2. Alice deploys protocol contract passing verifier address;
3. Alice deploys NFT contract passing protocol address;
4. Alice mints NFT to herself and gives approval for protocol contract;
5. Alice calls depositNFT function of protocol contract with NFT contract address, NFT id and public key of signer S;
6. Protocol transfers NFT from Alice to itself and keeps it;
7. Bob signs message wih private key of shared signer S;
8. Bob calls withdrawNFT function of protocol contract with signature;
9. Protocol contract verifies signer and transfer NFT to Bob.