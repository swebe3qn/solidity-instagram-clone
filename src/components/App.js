import React, { Component } from 'react';
import getWeb3 from "./getWeb3";
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      loading: true,
      images: []
    }

    this.tipImageOwner = this.tipImageOwner.bind(this);
  }

  componentDidMount = async() => {
    try {
      this.web3 = await getWeb3();
      let accounts = await this.web3.eth.getAccounts();
      this.setState({account: accounts[0]});

      let networkId = await this.web3.eth.net.getId();
      this.decentragram = new this.web3.eth.Contract(Decentragram.abi, Decentragram.networks[networkId].address);

      this.getImages();
    } catch (err) {
      console.log(err)
      alert('Failed to load smart contract data.')
    }
  }

  getImages = async() => {
    let imageCount = await this.decentragram.methods.imageCount().call();
    
    for (let i = 0; i < imageCount; i++) {
      let image = await this.decentragram.methods.images(i).call();
      this.setState({images: [...this.state.images, image]});
    }

    this.setState({loading: false});
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  uploadImage = description => {
    ipfs.add(this.state.buffer, (error, result) => {
      if(error) {
        console.error(error)
        alert('There was an error. Please try again (later).')
        return
      }

      this.setState({ loading: true })
      this.decentragram.methods.uploadImage(result[0].hash, description).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }

  tipImageOwner(id, tipAmount) {
    this.setState({ loading: true })
    this.decentragram.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
              tipImageOwner={this.tipImageOwner}
              images={this.state.images}
              web3={this.web3}
            />
          }
        }
      </div>
    );
  }
}

export default App;