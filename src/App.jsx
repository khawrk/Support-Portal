import React, {useState, useEffect} from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/SupportPortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("")
  const [count, setCount] = useState(0) //set initial count
  const [allHearts, setAllHearts] = useState([])

  
  const contractAddress = "0x9893789F4965D3dB6B519d4cDE61181608e28752"; // the contract we deployed to Rinkeby
  const contractABI = abi.abi // reference to our ABI from VS CODE
  
const checkIfWalletIsConnected = async () => {
    try {
    const { ethereum } = window;
      
    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return;
    } else {
      console.log("We have the ethereum object", ethereum)
    }
      
    const accounts = await ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  } 

// function submitHeart(event) {
//   const {value} = event.target
//   setAllHearts([{
//     address: "",
//     timestamp: "",
//     message: value
//   }])
//   heart()
// }

  
const heart = async (message) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const supportPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await supportPortalContract.getTotalHearts();
        setCount(count.toNumber())
        // console.log("Retrieved total heart count...", count.toNumber());
        
        // * Execute the actual heart from smart contract
        const heartTxn = await supportPortalContract.heart(message,{ gasLimit: 300000 });
        console.log("Mining...", heartTxn.hash);

        await heartTxn.wait();
        console.log("Mined -- ", heartTxn.hash);

        count = await supportPortalContract.getTotalHearts();
        setCount(count.toNumber())
        
        // console.log("Retrieved total heart count...", count.toNumber())
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}

function handleChange(event) {
  const text = event.target.value
  setAllHearts(allHearts.message = value)
  // setAllHearts(allHearts.message = value)
  // console.log(allHearts)
}
    
  
const getAllHearts = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const supportPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const hearts = await supportPortalContract.getAllHearts();

        const heartsCleaned = hearts.map((heart) => {
                    return {
                        address: heart.waver,
                        timestamp: new Date(heart.timestamp * 1000),
                        message: heart.message,
                    };
                });

        setAllHearts(heartsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
        let supportPortalContract;

        const onNewHeart = (from, timestamp, message) => {
            console.log("NewHeart", from, timestamp, message);
            setAllHearts((prevState) => [
                ...prevState,
                {
                    address: from,
                    timestamp: new Date(timestamp * 1000),
                    message: message,
                },
            ]);
        };

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            supportPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
            supportPortalContract.on("NewHeart", onNewHeart);
        }

        return () => {
            if (supportPortalContract) {
                supportPortalContract.off("NewHeart", onNewHeart);
            }
        };
    }, []);
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Khaw and I'm now working on my Web3 Startup.
        <br/>
        Happy to chat about that more and count you in as one of our early supporters 
        </div>

        <form id="message">
          <label for="message">Let us know what do you think</label>
          <textarea row="5" cols="30" type="text" name="message" id="message" placeholder="Send us something"></textarea>
        <button className="supportButton" onClick={heart}>
          Submit your message and send some 💛 
        </button>
          </form>
        {!currentAccount && (
          <button className="supportButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
         <p className="heartShow">Total hearts received: {count}</p>
        
        {allHearts.map((heart, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {heart.address}</div>
              <div>Time: {heart.timestamp.toString()}</div>
              <div>Message: {heart.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App