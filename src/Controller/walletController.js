var Web3 = require("web3");
const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const walletModel=require("../Model/walletModel")
const userModel=require("../Model/userModel")
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://data-seed-prebsc-1-s1.binance.org:8545/"
  )
);

const { contractABI, contract } = require("../config/bip20");

const myContract = new web3.eth.Contract(contractABI, contract);
const mnemonic =
  "uncover slide spray lab gospel echo brush enable stairs quick truck verify";

module.exports = {
  generateMnemonic: async (req, res) => {
    try {
        const userId=req.params.userId
        const userdata=await userModel.findOne({_id:userId})
        if(userdata){
      const mnemonic = bip39.generateMnemonic();
      const walletdata=await walletModel.create(mnemonic)
      return res.status(200).send({ responseCode: 200, responseMessage: "Generated.", responseResult: walletdata, })
    }
    else{
        return res.status(400).send({msg:'please create your user credentials first'})
    };
   
      
    } catch (error) {
      return res
        .status(501)
        .send({
          responseMessage: "Couldn't Generate Wallet",
          responseResult: error,
        });
    }
  },

  generateAddress: (req, res) => {
    try {
      const seed = bip39.mnemonicToSeedSync(req.query.mnemonic);

      let hdwallet = hdkey.fromMasterSeed(seed);
      let countvalue = req.query.count ? req.query.count : 0;
      let path = `m/44'/60'/0'/0/${countvalue}`;

      let wallet = hdwallet.derivePath(path).getWallet();
      let address = "0x" + wallet.getAddress().toString("hex");
      let privateKey = wallet.getPrivateKey().toString("hex");
      res.send({
        responseCode: 200,
        responseMessage: "Account Created successfully.",
        responseResult: { address: address, privateKey: privateKey },
      });
      // return { address, privateKey };
    } catch (error) {
      console.log(error);
      res.send({
        responseCode: 501,
        responseMessage: "Something went wrong!!!",
        responseResult: error.message,
      });
    }
  },
  getBalance: async (req, res) => {
    try {
      if (!req.query.address) {
        return res.status(404).json({ Message: `Invalid payment details.` });
      }
      var userBalance = await myContract.methods
        .balanceOf(req.query.address)
        .call();
      // const decimals = await myContract.methods.decimals().call()

      userBalance = web3.utils.fromWei(userBalance);
      return res
        .status(200)
        .send({
          responseCode: 200,
          responseMessage: "Balance fetched successfully.",
          responseResult: { balance: Number(userBalance) },
        });
    } catch (error) {
      return res
        .status(501)
        .send({
          responseCode: 501,
          responseMessage: "Something went wrong!",
          error: error.message,
        });
    }
  },

  withdraw: async (req, res) => {
    try {
      if (
        !req.body.recieverAddress ||
        !req.body.privateKey ||
        !req.body.amountToSend
      ) {
        return res.status(404).json({ Message: `Invalid payment details.` });
      }
      console.log("req.body==>>", req.body);
      let { recieverAddress, privateKey, amountToSend } = req.body;
      const balance = web3.utils.toWei(amountToSend.toString());

      const Data = await myContract.methods
        .transfer(recieverAddress, balance.toString())
        .encodeABI();

      const rawTransaction = {
        to: contract,
        gasPrice: web3.utils.toHex("30000000000"), // Always in Wei (30 gwei)
        gasLimit: web3.utils.toHex("200000"), // Always in Wei
        data: Data, // Setting the pid 12 with 0 alloc and 0 deposit fee
      };
      console.log("rawTransaction==>>", rawTransaction);
      console.log("privateKey====>>", privateKey);
      const signPromise = await web3.eth.accounts.signTransaction(
        rawTransaction,
        privateKey.toString()
      );
      console.log("signPromise====>", signPromise);

      web3.eth
        .sendSignedTransaction(signPromise.rawTransaction)
        .then((data) => {
          console.log({
            responseCode: 200,
            Status: "Success",
            Hash: signPromise.transactionHash,
          });
          return res
            .status(200)
            .json({
              responseCode: 200,
              responseMessage: "Success",
              responseResult: data,
            });
        })
        .catch((error) => {
          console.log({
            responseCode: 501,
            responseMessage: "Something went wrong!",
            error: error,
          });

          res
            .status(501)
            .send({
              responseCode: 501,
              responseMessage: "Something went wrong!",
              error: error,
            });
        });
    } catch (error) {
      console.log("error==>>", error);
      return res
        .status(501)
        .send({
          responseCode: 501,
          responseMessage: "Something went wrong!",
          error: error.message,
        });
    }
  },

  transfer: async (req, res) => {
    try {
      if (
        !req.body.senderAddress ||
        !req.body.recieverAddress ||
        !req.body.privateKey
      ) {
        return res.status(404).json({ Message: `Invalid payment details.` });
      }
      let { senderAddress, recieverAddress, privateKey } = req.body;

      var balance = await myContract.methods.balanceOf(senderAddress).call();

      const Data = await myContract.methods
        .transfer(recieverAddress, balance.toString())
        .encodeABI();

      const rawTransaction = {
        to: contract,
        gasPrice: web3.utils.toHex("30000000000"), // Always in Wei (30 gwei)
        gasLimit: web3.utils.toHex("200000"), // Always in Wei
        data: Data, // Setting the pid 12 with 0 alloc and 0 deposit fee
      };
      const signPromise = await web3.eth.accounts.signTransaction(
        rawTransaction,
        privateKey.toString()
      );

      web3.eth
        .sendSignedTransaction(signPromise.rawTransaction)
        .then((data) => {
          console.log({
            responseCode: 200,
            Status: "Success",
            Hash: signPromise.transactionHash,
          });
          return res
            .status(200)
            .json({
              responseCode: 200,
              responseMessage: "Success",
              responseResult: data,
            });
        })
        .catch((error) => {
          console.log({
            responseCode: 501,
            responseMessage: "Something went wrong!",
            error: error,
          });

          res
            .status(501)
            .send({
              responseCode: 501,
              responseMessage: "Something went wrong!",
              error: error,
            });
        });
    } catch (error) {
      return res
        .status(501)
        .send({
          responseCode: 501,
          responseMessage: "Something went wrong!",
          error: error.message,
        });
    }
  },
};