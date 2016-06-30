var forge = require('node-forge');
var fs = require('fs');
var Web3 = require('web3');
var web3 = new Web3();
var solc = require('solc');
var Base58 = require('base-58');
var rsa = forge.pki.rsa;


M2Mpkx = function(config) {

		var c = { version:'0.1' };
			
		if(config.rpcProvider) c.rpcProvider=config.rpcProvider; else c.rpcProvider='http://localhost:8545';		
		if(config.path) c.path=config.path; else c.path="./";		
		this.config=c;
		try {
		    this.loadKeys();
		} catch(e) {
			console.log(e);
			this.createNewKeypair(); 
		}
		web3.setProvider(new web3.providers.HttpProvider(c.rpcProvider));
		if(config.fromAddress) c.fromAddress=config.fromAddress; else c.fromAddress=web3.eth.accounts[0];
		if(config.pwd) { web3.personal.unlockAccount(c.fromAddress, config.pwd, 300); c.pwd=config.pwd;}
		this.config=c;
};
M2Mpkx.prototype.pem = "";   		
M2Mpkx.prototype.pom = "";
M2Mpkx.prototype.pem_data = "";
M2Mpkx.prototype.pom_data = "";
M2Mpkx.prototype.createNewKeypair=function() {
		var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
		this.pem=keypair.publicKey;
		this.pom=keypair.privateKey;
		this.pem_data = forge.pki.publicKeyToPem(keypair.publicKey);
		this.pom_data = forge.pki.privateKeyToPem(keypair.privateKey);
		console.log(this.pem_data);
		
		fs.writeFile(this.config.path+"pub.pem", forge.pki.publicKeyToPem(keypair.publicKey), function(err) {    
			console.log("Public Key saved");
		}); 

		fs.writeFile(this.config.path+"priv.pem", forge.pki.privateKeyToPem(keypair.privateKey), function(err) {    
			console.log("Private Key saved");
		}); 
	};
	
	
M2Mpkx.prototype.loadKeys=function() {
		this.pem_data=fs.readFileSync(this.config.path+'pub.pem',{encoding:"utf-8"});
		this.pem = forge.pki.publicKeyFromPem(this.pem_data);	
	
		this.pom_data=fs.readFileSync(this.config.path+'priv.pem',{encoding:"utf-8"});
		this.pom = forge.pki.privateKeyFromPem(this.pom_data);
	
		console.log("Loaded keys...");
	};

M2Mpkx.prototype.config = {};
		
M2Mpkx.prototype.tx_addPKI=function(address) {
		if(this.config.pwd) web3.personal.unlockAccount(c.fromAddress, config.pwd, 300);
		var abi=JSON.parse(fs.readFileSync(this.config.path+'pkx.abi',{encoding:"utf-8"}));		
		var contract = web3.eth.contract(abi).at(address);
		if(contract.keys(this.config.fromAddress)==this.pem_data) return;
		
		//var gasEstimate = web3.eth.estimateGas({data: compilation.contracts.PKX.bytecode});
		contract.addPKI.sendTransaction(""+this.pem_data+"",{from:this.config.fromAddress,gas: 1000000},function(error, result){
			if(!error)
				console.log("TX Hash:"+result)
			else
				console.error(error);
		});	
		console.log("Adding PEM to Contract");		
	};
	
M2Mpkx.prototype.provideContract=function() {
		var contract_source=fs.readFileSync(this.config.path+'pkx.sol',{encoding:"UTF-8"});
		
		var compilation = solc.compile(contract_source, 1); // 1 activates the optimiser 
		fs.writeFile(this.config.path+"pkx.abi",compilation.contracts.PKX.interface,function(err) {console.log("Abi saved");});
		var contract = web3.eth.contract(JSON.parse(compilation.contracts.PKX.interface));		
		var gasEstimate = web3.eth.estimateGas({data: compilation.contracts.PKX.bytecode});
		console.log("Gas Estimate:"+gasEstimate);
		if(this.config.pwd) web3.personal.unlockAccount(c.fromAddress, config.pwd, 300);
		var contractTX = contract.new([0],{from:this.config.fromAddress, data: compilation.contracts.PKX.bytecode, gas: gasEstimate+30000}, function(e, contract){
		  if(!e) {

			if(!contract.address) {
			  console.log("Contract transaction send: TransactionHash: " + contract.transactionHash + " waiting to be mined...");

			} else {
			  console.log("Contract mined! Address: " + contract.address);
			  fs.writeFile(this.config.path+"pkx.address",""+contract.address,function(err) {console.log("Saving Contract Address",err);});
			  tx_addPKI(contract.address)			  			  
			}

		} else {console.log("Error in ContractTX:"+e);
			    console.log("If this failed - you might create a pkx.address file manualy");}
		});				
		//console.log(compilation);		
	};
	
M2Mpkx.prototype.getContract=function(address) {
		var abi = {};
		try {
			abi=JSON.parse(fs.readFileSync(this.config.path+'pkx.abi',{encoding:"utf-8"}));
		} catch(e) {
			// Fallback to default ABI in case we never deployed a PKX
			abi=JSON.parse(fs.readFileSync('pkx.abi',{encoding:"utf-8"}));
		}
		var contract = web3.eth.contract(abi).at(address);
		return contract;		
	};
		
M2Mpkx.prototype.encrypt = function(contract_address,to_address,data) {
		var c = this.getContract(contract_address);
		if(c.keys(this.config.fromAddress)!=this.pem_data) {
				this.tx_addPKI(contract_address);
				// No Encryption if we see this contract first time... have to wait for blockchain TX
				throw "Need to wait for Blockchain to have our PubKey in Contract";
		}
		var rem_key=c.keys(to_address);
		if(rem_key=="0x") throw "No Address for Contract";
		var _pem = forge.pki.publicKeyFromPem(rem_key);		
		return _pem.encrypt(data);		
}

M2Mpkx.prototype.decrypt = function(data) {
		return this.pom.decrypt(data);
}
module.exports=M2Mpkx;

// 0x6675cc2a29109a7d99e4e3c8cac4d43871ff01dc

/*
pem2 = forge.pki.publicKeyFromPem(Base58.decode(c.owner_key()));

if(pem2==pem) console.log("Fire!");
var encrypted = pem2.encrypt("Hallo");
console.log(encrypted);
var descyrpt = pom.decrypt(encrypted);
console.log(descyrpt);
*/
//this.provideContract();

	
// Test Contract 1: 0x4ab15291a0fd8d97a29dc0f6a72c6e8a4a5aa1af
// Test Contract 2: 0xe91af63d019476b781ecfb9cb6840fc7a8a58424
