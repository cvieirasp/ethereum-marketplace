import React, { Component } from 'react';

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="/">
          Mercado Blockchain
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          <small className="text-white">Conta: <span id="account">
            <a href={`https://rinkeby.etherscan.io/address/${this.props.account}`} 
              className="text-white"
              rel="noopener noreferrer" 
              target="_blank">{this.props.account}</a>
          </span></small>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
