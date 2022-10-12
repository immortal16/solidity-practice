from web3 import Web3
import json

from config import reputationRouterAddress, enpointAddress, endpointPrivateKey , shareholderAddress, shareholderPrivateKey

class ReputationRouterRPC:

    def __init__(self, url, reputationRouterAddress, reputationRouterAbi) -> None:
        self.w3 = Web3(Web3.HTTPProvider(url))
        self.reputationRouterAddress = reputationRouterAddress
        self.reputationRouter = self.w3.eth.contract(address=reputationRouterAddress, abi=reputationRouterAbi)
        self.chain_id = self.w3.eth.chain_id

    def sign_raw_transaction(self, raw_transaction, endpointPrivateKey):
        return self.w3.eth.account.sign_transaction(transaction_dict=raw_transaction, private_key=endpointPrivateKey)

    def send_raw_transaction(self, signed_transaction):
        send = self.w3.eth.sendRawTransaction(signed_transaction.rawTransaction)
        txid = send.hex()
        print(f'txid: {txid}')
        return txid
    
    def create_addIoC_raw_transaction(self, endpointAddress, iocHash, shareholderPrivateKey):
        functionPrototype = 'addIoC(bytes32,bytes)'
        functionSelector = Web3.keccak(text=functionPrototype).hex()[0:10]  #'0xeee20731'
        extraData = '0x'
        ethSignedMessageHash = "0x" + self.reputationRouter.functions.getMessageHashWithEthSign(enpointAddress, functionSelector, iocHash, extraData).call().hex()
        
        signData = self.w3.eth.account.signHash(message_hash=ethSignedMessageHash, private_key=shareholderPrivateKey)
        signature = signData.signature.hex()
        
        nonce = self.w3.eth.getTransactionCount(enpointAddress)
        gas_price = self.w3.eth.gas_price

        data = self.reputationRouter.encodeABI(fn_name="addIoC", args=[iocHash, signature])
        
        tx = {
            'from': endpointAddress,
            'to': self.reputationRouterAddress,
            'data': data,
            'gas': 1_000_000,
            'gasPrice': gas_price, 
            'nonce': nonce,
            'chainId': self.chain_id
        }
        return tx

    def create_reportIoC_raw_transaction(self, endpointAddress, iocHash, reportHash, shareholderPrivateKey):
        functionPrototype = 'reportIoC(bytes32,bytes32,bytes)'
        functionSelector = Web3.keccak(text=functionPrototype).hex()[0:10]  #'0xeb6bfde9'
        extraData = reportHash
        ethSignedMessageHash = "0x" + self.reputationRouter.functions.getEthSignedMessageHashFull(enpointAddress, functionSelector, iocHash, extraData).call().hex()
        
        signData = self.w3.eth.account.signHash(message_hash=ethSignedMessageHash, private_key=shareholderPrivateKey)
        signature = signData.signature.hex()
        
        nonce = self.w3.eth.getTransactionCount(enpointAddress)
        gas_price = self.w3.eth.gas_price

        data = self.reputationRouter.encodeABI(fn_name="reportIoC", args=[iocHash, reportHash, signature])
        
        tx = {
            'from': endpointAddress,
            'to': self.reputationRouterAddress,
            'data': data,
            'gas': 1_000_000,
            'gasPrice': gas_price, 
            'nonce': nonce,
            'chainId': self.chain_id
        }
        return tx

    def create_mintIoC_raw_transaction(self, endpointAddress, iocHash, iocData, shareholderPrivateKey):
        '''

        :param iocData: any string that contains info about indicator of comprometation (ioc)
        '''
        functionPrototype = 'mintIoC(bytes32,string,bytes)'
        functionSelector = Web3.keccak(text=functionPrototype).hex()[0:10]  #'0xcecac20b'
        extraData = "0x" + iocData.encode().hex()
        ethSignedMessageHash = "0x" + self.reputationRouter.functions.getEthSignedMessageHashFull(enpointAddress, functionSelector, iocHash, extraData).call().hex()
        
        signData = self.w3.eth.account.signHash(message_hash=ethSignedMessageHash, private_key=shareholderPrivateKey)
        signature = signData.signature.hex()
        
        nonce = self.w3.eth.getTransactionCount(enpointAddress)
        gas_price = self.w3.eth.gas_price

        data = self.reputationRouter.encodeABI(fn_name="reportIoC", args=[iocHash, iocData, signature])
        
        tx = {
            'from': endpointAddress,
            'to': self.reputationRouterAddress,
            'data': data,
            'gas': 1_000_000,
            'gasPrice': gas_price, 
            'nonce': nonce,
            'chainId': self.chain_id
        }
        return tx

    
bsctest = 'https://data-seed-prebsc-1-s1.binance.org:8545'
mumbai = 'https://matic-mumbai.chainstacklabs.com'

print("reputationRouterAddress: " + reputationRouterAddress)
reputationRouterPath = '../../artifacts/contracts/ReputationRouter.sol/ReputationRouter.json'
reputationRouterJson = json.load(open(reputationRouterPath))
reputationRouterAbi = reputationRouterJson['abi']

router = ReputationRouterRPC(url=mumbai, reputationRouterAddress=reputationRouterAddress, reputationRouterAbi=reputationRouterAbi)

tx1 = router.create_addIoC_raw_transaction(
    endpointAddress=enpointAddress, 
    iocHash='0xed9a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7934c527ae',
    shareholderPrivateKey=shareholderPrivateKey
    )
signed_tx1 = router.sign_raw_transaction(raw_transaction=tx1, endpointPrivateKey=endpointPrivateKey)
router.send_raw_transaction(signed_transaction=signed_tx1)

# tx2 = router.create_reportIoC_raw_transaction(
#     endpointAddress=enpointAddress, 
#     iocHash='0xed9a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7934c527ae', 
#     reportHash='0xffff63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7934c527ae', 
#     shareholderPrivateKey=shareholderPrivateKey
#     )
# signed_tx2 = router.sign_raw_transaction(raw_transaction=tx2, endpointPrivateKey=endpointPrivateKey)
# router.send_raw_transaction(signed_transaction=signed_tx2)



# tx3 = router.create_mintIoC_raw_transaction(
#     endpointAddress=enpointAddress, 
#     iocHash='0xed9a63dcec80ed75c82f36161f17b9c2f407860160383a7be0a0ee7934c527ae', 
#     iocData="{ioc:91}", 
#     shareholderPrivateKey=shareholderPrivateKey
#     )
# signed_tx3 = router.sign_raw_transaction(raw_transaction=tx3, endpointPrivateKey=endpointPrivateKey)
# router.send_raw_transaction(signed_transaction=signed_tx3)