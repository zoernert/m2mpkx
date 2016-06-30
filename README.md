M2Mpkx
=========

Exchange/Registrar for public keys designed for IoT (m2m) usage. Creates a public/private key pair on the fly and publishs it to a smart contract within the Ethereum block chain. As soon as blockchain reflects transaction it allows to encrypt data for each party using the same smart contract.

## Use Case

Sensor A would like to publish data to remote entity B. Both are using Contract at address 0xC 

Sensor A calls: 
```
var encrypted_data = m2mpkx.encrypt("0xC",m2m.config.fromAddress,data);
```
encrypted_data might be send via unsecure channel (like IPFS).


Entity B calls:
```
var data=m2mpkx.decrypt(encrypted_data);
```

## Installation
```
  npm install M2Mpkx --save
```
## Requirement

Requires local GETH (Go-Ethereum) node to run with RPCAPI enabled. 

Sample Command Line:
```
	geth --rpc --rpcapi "eth,net,web3,personal" --rpcaddr "localhost"  --rpcport "8545"   
```
If you do not unlock an account (--unlock), you will have to provide a password in your config!

## Usage
```javascript
  var M2Mpkx=require("m2mpkx");
  var config = {
	path:'test\\', // If no Path is specified current directory is used to store persistent files (keys, abi,...)
    pwd:'PASSWORD', // Password to unlock account (if not done via geth call)
	rpcProvider:'http://localhost:8545' // Optional
  }
  
  // If new instance is created module checks if keys exist and if not create a new key pair
  var m2m=new M2Mpkx(config);
  
  m2m.provideContract(); // Publishs new contract to blockchain. 
  try { 
	m2m.encrypt(contract_address,to_address,data); // encrypts data for to_address to be found in contract_address 
  } catch(e) { 
    /* NOTE: We expect a throw in case our public key is not registered within the contract 
	         Module tries to publish public key and throws exception.
	*/
	console.log(e);
  }
  
  m2m.decrypt(data); // decrypts data with private key  
```
 
## Contributing


## Release History

* 0.0.1 Initial release