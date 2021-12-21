import React, { Component } from 'react';
import { BrowserRouter, Routes , Route } from "react-router-dom";
import Web3 from 'web3'
import './App.css';
import Marketplace from '../abis/Marketplace.json'
import Navbar from './Navbar'
import Main from './Main'
import Edit from './Edit'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if (networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
      this.setState({ marketplace })
      const productCount = await marketplace.methods.productCount().call()
      // console.log(productCount.toString())
      this.setState({ productCount })
      //Load products
      for (let i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false })
      console.log(this.state.products)
      const contractOwner = await this.state.marketplace.methods.getOwner().call()
      console.log(this.state.contractOwner)
      this.setState({ contractOwner })
    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      productCount: 0,
      products: [],
      loading: true
    }

    this.purchaseProduct = this.purchaseProduct.bind(this);
    this.loadProducts = this.loadProducts.bind(this);
    //this.callbackMarketplace = this.callbackMarketplace.bind(this);
    this.reload = this.reload.bind(this);
  }

  /*async callbackMarketplace(error, transactionHash) {
    console.log(`Transaction Hash (Create Product): ${transactionHash}`);
    if (error)
      console.log(`Error (Create Product): ${error.message}`);
    this.setState({ loading: false });
    this.loadProducts();
  }*/

  async reload() {
    this.setState({ loading: false });
    await this.loadProducts();
  }

  /*createProduct = (name, price, forSale) => {
    this.setState({ loading: true });
    this.state.marketplace.methods.createProduct(name, price, forSale)
      .send({ from: this.state.account }, this.callbackMarketplace);
  }*/

  createProduct = (name, price, forSale) => {
    this.setState({ loading: true });
    this.state.marketplace.methods.createProduct(name, price, forSale)
      .send({ from: this.state.account })
      .once('confirmation', async (confirmationNumber, receipt) => {
        console.log(`Confirmation Number: ${confirmationNumber}`);
        console.log(receipt);
        this.setState({ loading: false });
        await this.loadProducts();
      }).once('error', (error, receipt) => {
        console.log(error);
        this.setState({ loading: false });
      });
  }
  
  /*purchaseProduct(id, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.purchaseProduct(id)
      .send({ from: this.state.account, value: price }, this.callbackMarketplace);
  }*/

  purchaseProduct(id, price) {
    this.setState({ loading: true });
    this.state.marketplace.methods.purchaseProduct(id)
      .send({ from: this.state.account, value: price })
      .once('confirmation', async (confirmationNumber, receipt) => {
        console.log(`Confirmation Number: ${confirmationNumber}`);
        console.log(receipt);
        this.setState({ loading: false });
        await this.loadProducts();
      }).once('error', (error, receipt) => {
        console.log(error);
        this.setState({ loading: false });
      });
  }

  async loadProducts() {
    const productCount = await this.state.marketplace.methods.productCount().call();
    console.log(`Último ID ${productCount}`);
    this.setState({ products: [] });
    for (let i = 1; i <= productCount; i++) {
      const product = await this.state.marketplace.methods.products(i).call();
      this.setState({
        products: [...this.state.products, product]
      });
    }
  }

  render() {
    return (
      <>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <main role="main" className="col-lg-12 d-flex">
                {this.state.loading
                  ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                  : <Main
                    account = {this.state.account}
                    contractOwner={this.state.contractOwner}
                    products = {this.state.products}
                    createProduct = {this.createProduct}
                    purchaseProduct = {this.purchaseProduct} />
                }
                </main>
              } exact />
              <Route path=":id" element={
                <Edit 
                marketplace={this.state.marketplace} 
                account={this.state.account} 
                loadProducts = {this.loadProducts} />
              } exact />
              <Route
                path="*"
                element={
                  <main style={{ padding: "1rem" }}>
                    <p>There's nothing here!</p>
                  </main>
                }
              />
            </Routes>
          </BrowserRouter>
          </div>
          <div className="row">
            <footer style={{margin: '10px auto'}}>
              <h2>Integrantes do Grupo</h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Carlos Henrique Vieira Figueiredo</li>
                <li className="list-group-item">Emmanuel Rodrigues Barbosa da Silva</li>
                <li className="list-group-item">Hugo Teodoro Calandrini De Azevedo Melo</li>
                <li className="list-group-item">Jefferson Silva dos Santos</li>
              </ul>
            </footer>
          </div>
        </div>
      </>
    );
  }
}

export default App;
