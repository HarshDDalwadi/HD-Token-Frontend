import { useEffect, useState } from 'react';
import { ethers } from "ethers";
import './App.css';
import contract from "./artifacts/contracts/HDToken.sol/HDToken.json";
import variables from './variables';


function App() {
	const [address, setAddress] = useState("");
	const [loading, setLoading] = useState("");
	const [amount, setAmount] = useState(0);
	const [totalSupply, setTotalSupply] = useState(0);
	const [show, setShow] = useState(true);
	const { ethereum } = window;
	const [balance, setBalance] = useState(-1);
	const [tokenBalance, setTokenBalance] = useState(-1);
	const contractAddress = variables.CONTRACT_ADDRESS;
	const provider = new ethers.providers.JsonRpcProvider(variables.INFURA_ENDPOINT);
	const [privateKey, setPrivateKey] = useState(variables.PRIVATE_KEY);
	const [beforePKey, setBeforePKey] = useState("");
	const [transferToken, setTransferToken] = useState(0);
	const [transferAddress, setTransferAddress] = useState("");
	const getContractData = new ethers.Contract(
		contractAddress,
		contract.abi,
		provider
	)

	const wallet = new ethers.Wallet(privateKey, provider);

	const sendContractTx = new ethers.Contract(
		contractAddress,
		contract.abi,
		wallet
	)

	const connectWalletHandler = async () => {
		if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
			try {
				await ethereum.request({
					method: "wallet_requestPermissions",
					params: [
						{
							eth_accounts: {}
						}
					]
				});

				const accounts = await ethereum.request({ method: "eth_requestAccounts" });
				setAddress(accounts[0]);
				console.log(address);
				const balance = await ethereum.request({
					method: "eth_getBalance",
					params: [accounts[0], 'latest']
				});
				setBalance(ethers.utils.formatEther(balance));
				console.log(balance);
				const supply = await getContractData.totalSupply();
				setTotalSupply(supply / (10 ** 18));
				setShow(false);
			} catch (err) {
				console.log(err);
				alert(err.message);
			}
		}

		else {
			console.log("Please Install Metamask");
		}
	}

	const getBalance = async () => {
		try {
			setLoading("Getting Balance...Please Wait");
			const new_tokenBalance = await getContractData.balanceOf(address);
			console.log(ethers.utils.formatEther(new_tokenBalance))
			setTokenBalance(ethers.utils.formatEther(new_tokenBalance));
			console.log(tokenBalance);
			setLoading("");
		} catch (err) {
			alert(err.message);
		}
	}


	useEffect(() => {
		ethereum.on('accountsChanged', (accounts) => {
			setAddress(accounts[0])
			console.log(accounts);
			console.log("Address : " + address);
			const getBal = async () => {
				const balance = await ethereum.request({
					method: "eth_getBalance",
					params: [accounts[0], 'latest']
				})
				setBalance(ethers.utils.formatEther(balance));
			}

			getBal();
		})
	})

	const unstake = async () => {
		try {
			console.log("Unstaking");
			setLoading("Unstakking tokens...Please Wait");
			const tx = await sendContractTx.unstake();
			await tx.wait();
			console.log("Unstaking Successful");
			getBalance();
			alert("Unstaking Completed");
			setLoading("");
		} catch (err) {
			alert(err.message);
			console.log(err);
		}

	}

	const stake = async () => {
		try {
			console.log("Staking tokens...Please Wait");
			setLoading("Staking...Please Wait");
			const tx = await sendContractTx.stake(amount);
			await tx.wait();
			console.log("Stake successful");
			setAmount(0);
			getBalance();
			alert("Staking Completed");
			setLoading("");
		} catch (err) {
			console.log(err);
			alert(err.message);
		}
	}

	const getReward = async () => {
		try {
			console.log("Getting Reward");
			setLoading("Fetching Rewards...Please Wait");
			const tx = await sendContractTx.claimRewards();
			tx.wait();
			getBalance();
			console.log("Reward Added");
			setLoading("");
			alert("Kindly reload the page to get the fetched rewards shown on the page, it takes a while to write on the blockchain 😀");
		} catch (err) {
			console.log(err);
			alert(err.message);
		}
	}

	const handleSubmit = () => {
		setPrivateKey(beforePKey);
		setBeforePKey("");
	}

	const handleTransfer = async () => {
		setLoading("Transfering...Please Wait");
		const value = ethers.BigNumber.from(transferToken).mul(ethers.BigNumber.from('10').pow(18));
		const tx = await sendContractTx.transfer(transferAddress, value);
		tx.wait();
		getBalance();
		alert("Transaction Successful, Kindly reload the page to get the fetched rewards shown on the page, it takes a while to write on the blockchain 😀");
		setLoading("");
		setTransferAddress("");
		setTransferToken("");
	}

	return (
		<div className="app">
			<h3>Basic HD Token (HDT) with Staking Mechanism</h3>
			<h4>Contract Address : {variables.CONTRACT_ADDRESS}</h4>
			<div className="loadingDiv">
				{loading !== "" ? "Status : " + loading : ""}
			</div>
			{show && <button onClick={connectWalletHandler} className="buttonOne all">Connect to Metamask</button>}
			<div>
				<p>Before performing the stake, unstake, claim reward and transfer operations kindly pass in your private key (You can trust me please! 🥺)</p>
				<label htmlFor="input1">Enter your private key</label>
				<input value={beforePKey} className="input1 all" type="text" placeholder="Enter the private key" onChange={(e) => setBeforePKey(e.target.value)} />
				<button className="buttonFour" onClick={handleSubmit}>Submit</button>
			</div>
			<div className="container all">
				<p>{address ? "Your Address is :  " + address : ""}</p>
				<br />
				<p>{balance !== -1 ? "Your balance is : " + balance + ' goerli ethers' : "Please Connect to Metamask"}</p>
				<br />
				<p>Total Supply : {totalSupply !== -1 ? totalSupply + " HDT" : "Connect to metamask"}</p>
				<br />
				<p>Your balance Tokens : {tokenBalance !== -1 ? tokenBalance + " HDT" :
					<button onClick={getBalance} className="buttonFour">Click</button>}
					{tokenBalance !== -1 && <button onClick={getBalance} className="buttonOne all">Click to Update</button>}
				</p>
				<br />
			</div>

			<div className="all">
				<input className="inputTwo" value={amount} type="text" placeholder="Enter stake value" onChange={(e) => setAmount(e.target.value)} />
				<button onClick={stake} className="buttonFour">Stake</button>
			</div>

			<div>
				<button onClick={unstake} className="buttonFour lastDiv">Unstake</button>
				<button onClick={getReward} className="buttonFour lastDiv">Get Reward</button>
			</div>

			<div>
				<input value={transferAddress} className="input1 all" type="text" placeholder="Enter the account number" onChange={(e) => setTransferAddress(e.target.value)} />
				<input value={transferToken} className="inputTwo all" type="text" placeholder="Enter Tokens value" onChange={(e) => setTransferToken(e.target.value)} />
				<button className="buttonFour" onClick={handleTransfer}>Transfer</button>
			</div>
		</div>
	);
}

export default App;
