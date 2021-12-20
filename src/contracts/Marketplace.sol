pragma solidity ^0.5.16;

contract Marketplace {
  address payable private owner;
  uint private tax;
  string public name;
  uint public productCount=0;
  mapping(uint => Product) public products;

  struct Product {
    uint id;
    string name;
    uint price;
    address payable owner;
    bool purchased;
    bool forSale;
  }

  event ProductCreated (
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased,
    bool forSale
  );

  event ProductPurchased (
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased,
    bool forSale
  );

  event ProductUpdated (
    uint id,
    string name,
    uint price,
    address payable owner,
    bool purchased,
    bool forSale
  );

  constructor() public {
    name = "Etherium Marketplace";
    owner = msg.sender;
  }

  function getOwner() public view returns(address) {    
    return owner;
  }

  function getBalance() public view returns(uint256) {
    return owner.balance;
  }

  function createProduct(string memory _name, uint _price, bool _forSale) public {
    // Nome do Produto obrigatório
    require(bytes(_name).length > 0, "Insira um nome de produto válido");
    // Preço válido obrigatório
    require(_price > 0, "Insira um preço de produto válido");
    // Incrementa o contador de produto
    productCount++;
    // Cria o Produto
    products[productCount] = Product(productCount, _name, _price, msg.sender, false, _forSale);
    // Aciona evento de criação de produto
    emit ProductCreated(productCount, _name, _price, msg.sender, false, _forSale);
  }

  function updateProduct(uint _id, uint _price, bool _forSale) public {
    // Busca o produto e faz uma cópia dele
    Product memory _product = products[_id];
    // Verifica se é o proprietário do produto
    require(msg.sender == _product.owner, "Somente proprietário possui permissão de alterar dados");
    // Preço válido obrigatório
    require(_price > 0, "Insira um preço de produto válido");
    
    // Atualiza Produto com novos valores.
    _product.price = _price;
    _product.forSale = _forSale;
    products[_id] = _product;
    // Aciona um evento de alteração de produto
    emit ProductUpdated(_id, _product.name, _price, _product.owner, _product.purchased, _forSale);
  }

  function purchaseProduct(uint _id) public payable {
    // Busca o produto e faz uma cópia dele
    Product memory _product = products[_id];
    // Busca o dono
    address payable _seller = _product.owner;
    // Verifica se o produto possui um id válido
    require(_product.id > 0 && _product.id <= productCount, "Insira um ID válido");
    // VErifica se o produto está a venda
    require(_product.forSale == true, "Produto não está à venda");
    // Requer que haja Ether suficiente na transação
    require(msg.value >= _product.price, "Transfira a quantidade correta");
    // Requer que o produto ainda não tenha sido comprado
    require(!_product.purchased, "Produto já foi comprado");
    // Requer que o comprador não seja o vendedor
    require(msg.sender != _seller, "Comprador não pode ser o vendedor");
    // Transfere a propriedade do produto ao comprador
    _product.owner = msg.sender;
    // Marca o produto como comprado
    _product.purchased = true;
    // Marca o produto como não disponível para venda
    _product.forSale = false;
    // Atualiza o produto
    products[_id] = _product;

    // Calcula taxa que será enviada para o dono do contrato
    tax = (msg.value*5)/100;
    // Transfere 95% do valor (em Ether) para o vendedor
    address(_seller).transfer(msg.value-tax);
    // Transfere 5% do valor (em Ether) para o publicador do contrato
    address(owner).transfer(tax);

    // Aciona um evento de compra de produto
    emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true, false);
  }
}
