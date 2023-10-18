import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Contract, providers, ethers } from 'ethers';
import Web3Modal from 'web3modal';

import {
  DONATION_CAMPAIGN_ADDRESS,
  DONATION_CAMPAIGN_ABI
} from "../contract";

const Home = () => {

    const CHAIN_ID = 11155111;
    const NETWORK_NAME = "Sepolia";
    const CURRENCY = "ETH";

    const [walletConnected, setWalletConnected] = useState(false);
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null)
    const [title, setTitle] = useState(null);
    const [targetAmount, setTargetAmount] = useState(null);
    const [amountDonated, setAmountDonated] = useState(null);
    const [loading, setLoading] = useState(false);
    const [amountToDonate, setAmountToDonate] = useState("");
    const [contractOwner, setContractOwner] = useState(null);

    const web3ModalRef = useRef();

    // Helper function to fetch a Provider instance from Metamask
    const getProvider = useCallback(async () => {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(provider);
      const getSigner = web3Provider.getSigner();

      const { chainId } = await web3Provider.getNetwork();

      setAccount(await getSigner.getAddress());
      setWalletConnected(true)


      if (chainId !== CHAIN_ID) {
      window.alert(`Please switch to the ${NETWORK_NAME} network!`);
          throw new Error(`Please switch to the ${NETWORK_NAME} network`);
      }
      setProvider(web3Provider);
  }, []);

  // Helper function to fetch a Signer instance from Metamask
  const getSigner = useCallback(async () => {
      const web3Modal = await web3ModalRef.current.connect();
      const web3Provider = new providers.Web3Provider(web3Modal);

      const { chainId } = await web3Provider.getNetwork();

      if (chainId !== CHAIN_ID) {
      window.alert(`Please switch to the ${NETWORK_NAME} network!`);
          throw new Error(`Please switch to the ${NETWORK_NAME} network`);
      }
      
      const signer = web3Provider.getSigner();
      return signer;
  }, []);


  const getCampaignInstance = useCallback((providerOrSigner) => {
    return new Contract(
        DONATION_CAMPAIGN_ADDRESS,
        DONATION_CAMPAIGN_ABI,
        providerOrSigner
    )
  },[]);

  const connectWallet = useCallback(async () => {
    try {
        web3ModalRef.current = new Web3Modal({
            network: NETWORK_NAME,
            providerOptions: {},
            disableInjectedProvider: false,
        });

        await getProvider();
    } catch (error) {
        console.error(error);
    }
  },[getProvider]);
  

  const donate = async (e) => {
    e.preventDefault();

    if(amountToDonate === "" || amountToDonate === 0){
      alert("Please input an amount greater than zero");
    } else {
      try {
        const amountInWei = ethers.utils.parseEther(amountToDonate);

        const signer = await getSigner();
        const donationContract = getCampaignInstance(signer);
        const txn = await donationContract.donate({ value: amountInWei });
        setLoading(true);
        await txn.wait();
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
  }

  const withdrawDonation = async (e) => {
    e.preventDefault();

    const signer = await getSigner();
    const donationContract = getCampaignInstance(signer);
    const txn = await donationContract.withdraw();
    setLoading(true);
    await txn.wait();
    setLoading(false);
  }

  // eslint-disable-next-line
  useEffect(() => {
    const fetchCampaignDetail = async () => {
      if(account && provider){
        const campaignContract = getCampaignInstance(provider);
        const title = await campaignContract.title();
        const targetAmount = await campaignContract.donationTarget();
        const amountDonated = await campaignContract.totalDonation();
        const owner = await campaignContract.owner();

        setTitle(title);
        setTargetAmount(targetAmount);
        setAmountDonated(amountDonated);
        setContractOwner(owner);
      }
    }

    fetchCampaignDetail()
  }, [account, provider, amountDonated]);

  useEffect(() => {
    if(!walletConnected) {
        connectWallet();
    }
  }, [walletConnected, connectWallet]);

  return (
    <Fragment>
      <div className="container mb-5">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <a className="navbar-brand" href="!#">
            Donation dApp
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarText"
            aria-controls="navbarText"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav mr-auto">
              
            </ul>
            
            <span className="navbar-text">
              {!walletConnected ? <button className="btn btn-primary" onClick={connectWallet}>Connect</button> : <button className="btn btn-danger" disabled>{account !== null ? account : "Connected"}</button>}
            </span>
          </div>
        </nav>
      </div>

      <div className="row">
        <div className="col-md-6 mt-5">
          <h2>Make donations in crypto currencies</h2>
          <p>
            Empower Change with a Click! Your donation, their brighter future. Join our blockchain-powered movement today
          </p>
          <div className="card">
            <div className="card-body">
              <h5 className="card-heading">{title !== null && title}</h5>
              <p>
                <strong>Target:</strong> {targetAmount !== null ? Number(targetAmount) : 0}{CURRENCY}
              </p>
              <p>
                <strong>Received:</strong> {amountDonated !== null ? ethers.utils.formatEther(amountDonated) : 0}{CURRENCY}
              </p>

              <form>
                  <div className="form-group">
                    <label htmlFor="target">Amount to Donate</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="Amount"
                      onChange={(e) => setAmountToDonate(e.target.value)}
                    />
                  </div>

                  <button className={loading ? "btn btn-secondary btn-block" : "btn btn-success btn-block"} disabled={loading ? "disabled" : ""} onClick={donate}>{loading ? "Processing" : "Donate"}</button>
                </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mt-5">
          <img src="women.webp" className="img-fluid rounded" alt="" />
          {account !== null && contractOwner !== null && account === contractOwner && 
            <button className={loading ? "btn btn-secondary btn-block mt-3" : "btn btn-primary btn-block mt-3"} disabled={loading ? "disabled" : ""} onClick={withdrawDonation}>{loading ? "Processing" : "Withdraw Donations"}</button>
          }
        </div>
      </div>
    </Fragment>
  );
};

export default Home;
