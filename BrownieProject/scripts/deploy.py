from brownie import accounts, IoC, IoCStorage, ReputationLock, ReputationRouter, ReputationToken


def deployIoC():
    print("\n***** IoC DEPLOYMENT *****")
    print("Deployer address: ", accounts[0].address)
    contract = IoC.deploy({'from': accounts[0]})
    return contract, contract.address
    

def deployIoCStorage():
    print("\n***** IoCStorage DEPLOYMENT *****")
    print("Deployer address: ", accounts[0].address)
    contract = IoCStorage.deploy({'from': accounts[0]})
    return contract, contract.address

def deployReputationLock():
    print("\n***** ReputationLock DEPLOYMENT *****")
    print("Deployer address: ", accounts[0].address)
    contract = ReputationLock.deploy({'from': accounts[0]})
    return contract, contract.address

def deployReputationRouter():
    print("\n***** ReputationRouter DEPLOYMENT *****")
    print("Deployer address: ", accounts[0].address)
    contract = ReputationRouter.deploy({'from': accounts[0]})
    return contract, contract.address

def deployReputationToken():
    print("\n***** ReputationToken DEPLOYMENT *****")
    print("Deployer address: ", accounts[0].address)
    contract = ReputationToken.deploy({'from': accounts[0]})
    return contract, contract.address

def deploySystem():
    shareholder = accounts[0]
    shareholderAddress = shareholder.address
    print("Shareholder address: ", shareholderAddress)

    reputationTokenContract, reputationTokenAddress_ = deployReputationToken()
    reputationLockContract, reputationLockAddress_ = deployReputationLock()
    iocStorageContract, iocStorageAddress_ = deployIoCStorage()
    iocContract, iocAddress_ = deployIoC()
    reputationRouterContract, reputationRouterAddress_ = deployReputationRouter()
    totalSupplyCap_ = 10000000000 * 10 ** 18

    tx = reputationRouterContract.initialize(
        reputationTokenAddress_,
        reputationLockAddress_,
        iocStorageAddress_,
        iocAddress_,
        totalSupplyCap_,
        {'from': shareholder}
    )

    tx.wait(1)

    print("ReputationRouter call initialize with params:");
    print("   reputationToken_: ", reputationTokenAddress_)
    print("   reputationLock_: ", reputationLockAddress_)
    print("   iocStorage_: ", iocStorageAddress_)
    print("   ioc_: ", iocAddress_)
    print("   totalSupplyCap_: ", totalSupplyCap_)

    return reputationTokenContract, reputationTokenAddress_, reputationLockContract, reputationLockAddress_, \
        iocStorageContract, iocStorageAddress_, iocContract, iocAddress_, reputationRouterContract, reputationRouterAddress_