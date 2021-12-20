import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function Edit(props) {
  const params = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    id: 0,
    name: "",
    price: 0,
    forSale: false,
    purchased: false,
    loading: true
  });

  useEffect(() => {
    async function fetchProduct() {
      if (props.marketplace && props.marketplace.methods) {
        const myproduct = await props.marketplace.methods.products(params.id).call();
        setState({
          id: params.id,
          name: myproduct.name,
          price: getPrice(myproduct.price),
          forSale: myproduct.forSale,
          purchased: myproduct.purchased
        });
        console.log(myproduct);
        console.log(`Account: ${props.account}`);
      }
    }
    fetchProduct();
  }, []);

  function handleChangePrice(evt) {
    setState({ ...state, price: evt.target.value });
  }

  function handleChangeForSale(evt) {
    setState({ ...state, forSale: evt.target.checked });
  }

  function getPrice(value) {
    return window.web3.utils.fromWei(value.toString(), "ether");
  }

  /*async function updateProduct() {
    if (props.marketplace && props.marketplace.methods) {
      const convertedPrice = window.web3.utils.toWei(state.price.toString(), 'Ether');
      await props.marketplace.methods.updateProduct(state.id, convertedPrice, state.forSale)
        .send({ from: props.account }, function(error, transactionHash) {
          console.log(`Transaction Hash (Update Product): ${transactionHash}`);
          if (error)
            console.log(`Error (Update Product): ${error.message}`);
          if (props.loadProducts)
            props.loadProducts();
          navigate("/");
        });
    }
  }*/

  async function updateProduct() {
    if (props.marketplace && props.marketplace.methods) {
      setState({...state, loading: true });
      const convertedPrice = window.web3.utils.toWei(state.price.toString(), 'Ether');
      await props.marketplace.methods.updateProduct(state.id, convertedPrice, state.forSale)
        .send({ from: props.account })
        .once('confirmation', function(confirmationNumber, receipt){
          console.log(`Confirmation Number: ${confirmationNumber}`);
          console.log(receipt);
          if (props.loadProducts)
            props.loadProducts();
            setState({...state, loading: false });
          navigate("/");
        })
        .on('error', function(error, receipt) {
          console.log(error);
          setState({...state, loading: false });
          navigate("/");
        });
    }
  }

  return (
    <div id="content-edit" style={{margin: '50px auto'}}>
      <h1>Editar Produto: {state.name}</h1>

      <form onSubmit={(event) => {
        event.preventDefault()
      }}>
        <div className="form-group mr-sm-2">
          <input
            id="productPrice"
            name="price"
            type="text"
            value={state.price}
            onChange={handleChangePrice}
            className="form-control"
            placeholder="Preço do produto (em Ether)"
            required 
            disabled={state.loading}/>
        </div>
        <div className="form-group form-check mr-sm-2">
          <input 
            id="forSale"
            name="forSale"
            type="checkbox" 
            checked={state.forSale}
            onChange={handleChangeForSale}
            className="form-check-input"
            disabled={state.loading}/>
          <label className="form-check-label" htmlFor="forSale">
            {state.purchased ? 'Revender o Produto?' : 'Produto disponível para venda?'}
          </label>
        </div>

        {
          state.loading ?
          <button className="btn btn-primary" type="button" disabled>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Aguarde...
          </button> :
          <>
          {state.id ?
            <button type="submit" className="btn btn-primary" style={{'marginRight': '10px'}}
              onClick={(event) => {
                updateProduct();
              }}>
              Salvar
            </button>
          : null}
          <Link className="btn btn-primary" to='/'>Voltar</Link>
          </>
        }

      </form>
    </div>
  );
}

export default Edit;
