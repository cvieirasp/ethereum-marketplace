import React, { Component } from 'react';
import { Link } from "react-router-dom";

class Main extends Component {
  render() {
    return (
      <div id="content" style={{margin: '50px auto'}}>
        <h1>Adicionar Produto</h1>

        <form onSubmit={(event) => {
          event.preventDefault()
          const name = this.productName.value;
          const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether');
          const forSale = this.forSale.checked;
          this.props.createProduct(name, price, forSale);
        }}>

          <div className="form-group mr-sm-2">
            <input
              id="productName"
              type="text"
              ref={(input) => { this.productName = input }}
              className="form-control"
              placeholder="Nome do produto"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.productPrice = input }}
              className="form-control"
              placeholder="Preço do produto (em Ether)"
              required />
          </div>
          <div className="form-group form-check mr-sm-2">
            <input 
              id="forSale" 
              type="checkbox" 
              ref={(input) => { this.forSale = input }}
              className="form-check-input"
            />
            <label className="form-check-label" htmlFor="forSale">
              Produto disponível para venda?
            </label>
          </div>
          <button type="submit" className="btn btn-primary">Adicionar produto</button>

        </form>

        <p>&nbsp;</p>

        <h2>Comprar produto</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Nome</th>
              <th scope="col">Preço</th>
              <th scope="col">Proprietário</th>
              <th scope="col">À venda</th>
              <th scope="col"></th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="productList">
            {this.props.products.map((product, key) => {
              return (
                <tr key={key}>
                  <th scope="row">{product.id.toString()}</th>
                  <td>{product.name}</td>
                  <td>{window.web3.utils.fromWei(product.price.toString(), "ether")} Eth</td>
                  <td>{product.owner}</td>
                  <td>{product.forSale ? 'SIM' : 'NÃO'}</td>
                  <td>
                    {product.forSale && this.props.account !== product.owner
                      ? <button className="btn btn-warning" name={product.id} value={product.price}
                          onClick={(event) => {
                            this.props.purchaseProduct(event.target.name, event.target.value)
                          }}>
                          Comprar
                        </button>
                      : null
                    }
                  </td>
                  <td>
                    {this.props.account === product.owner
                      ? <Link className="btn btn-danger" to={`/${product.id}`} key={product.id}>
                          Editar
                        </Link>
                      : null
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p>
          <a href="https://rinkeby.etherscan.io/address/0x85B6254eF762FA623682Db52fDF662E7A5F107C3" 
            rel="noopener noreferrer" 
            target="_blank">Informação do contrato</a>
        </p>
        <p>
          Dono do Contrato: <strong>
          <a href={`https://rinkeby.etherscan.io/address/${this.props.contractOwner}`} 
                style={{color: 'black'}}
                rel="noopener noreferrer" 
                target="_blank">{this.props.contractOwner}</a>
          </strong>
        </p>
      </div>
    );
  }
}

export default Main;
