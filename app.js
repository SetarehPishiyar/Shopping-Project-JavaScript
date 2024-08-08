const cartBtn = document.querySelector(".cart-btn");
const backdrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDOM = document.querySelector(".products-center");
const cartTotalPrice = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");
const confirmBtn = document.querySelector(".cart-item-confirm");
const searchInput = document.querySelector("#search");

let inCartProducts = [];
let allBtns = [];
let productsData = [];
let filteredProducts = [];

const _filters = {
    searchItem : "",
}

cartBtn.addEventListener("click", ShowModal);
closeModal.addEventListener("click", CloseModal);
backdrop.addEventListener("click", CloseModal);
confirmBtn.addEventListener("click", CloseModal);


document.addEventListener("DOMContentLoaded", async () => {
    try {
        searchInput.value = "";
        const res = await axios.get("http://localhost:3000/items");
        productsData = res.data;
        const ui = new UI();
        ui.setUpApp();
        ui.filterProducts(productsData, _filters);
        ui.displayProducts(filteredProducts);
        ui.getAddToCartBtns();
        ui.cartController();
        Storage.saveProducts(productsData);

        searchInput.addEventListener("input", (event)=>{
            _filters.searchItem = event.target.value;
            console.log(_filters.searchItem);
            ui.filterProducts(productsData, _filters);
            ui.displayProducts(filteredProducts);
        });

    } catch (err) {
        console.log(err.message);
    }
});



class UI{

    filterProducts(_products, _filters){
        filteredProducts = _products.filter((p)=>{
            return p.title.toLowerCase().includes(_filters.searchItem.toLowerCase());
        });
    }

    displayProducts(products){
        let result = '';
        products.forEach(p => {
            result+=`      
        <div class="product">
          <div class="img-container">
            <img src= ${p.imgURL} class="product-img" />
          </div>
          <div class="product-desc">
            <p class="product-price">$ ${p.price}</p>
            <p class="product-title">${p.title}</p>
          </div>
          <button class="btn add-to-cart" data-id=${p.id}>
            <i class="fas fa-shopping-cart"></i>
            Add to cart
          </button>
        </div>`;
        });

        productsDOM.innerHTML = result;
    }

    getAddToCartBtns(){
        const addToCartBtn = document.querySelectorAll(".add-to-cart");
        const addToCartBtnArr = [... addToCartBtn];
        allBtns = addToCartBtnArr;

        addToCartBtnArr.forEach(btn => {
            const id = Number(btn.dataset.id);
            inCartProducts = Storage.getCart() || [];
            // console.log(inCartProducts);
            const isInCart = inCartProducts.find(p => p.id === id);
            if(isInCart){
                btn.innerText = "Added to cart";
                btn.disabled = true;
            }
            
            
            btn.addEventListener("click", (event) => {
                event.target.innerText = "Added to cart";
                event.target.disabled = true;
                const addedProduct = {...Storage.getProduct(id), quantity:1};
                inCartProducts = [...inCartProducts, addedProduct];
                Storage.saveInCart(inCartProducts);
                this.setCartTotal(inCartProducts);
                this.addProductToCart(addedProduct);
            })
        });
    }

    setCartTotal(cart){
        let tempCartItemNumber = 0;
        const cartTotal = cart.reduce((acc, cur) => {
            tempCartItemNumber += cur.quantity;
            return acc + (cur.quantity * cur.price);
        } , 0);
        cartTotalPrice.innerText = `Total price: ${cartTotal.toFixed(2)}$`;
        cartItems.innerText = tempCartItemNumber;
    }

    addProductToCart(product){
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img class="cart-item-img" src="${product.imgURL}"/>
            <div class="cart-item-desc">
              <h4>${product.title}</h4>
              <h5>$ ${product.price}</h5>
            </div>
            <div class="cart-item-conteoller">
              <i class="fas fa-chevron-up" data-id=${product.id}></i>
              <p>${product.quantity}</p>
              <i class="fas fa-chevron-down" data-id=${product.id}></i>
            </div>
            <i class="fas fa-trash-alt" data-id=${product.id}></i>
        `;
        cartContent.appendChild(div);
    }

    setUpApp(){
        inCartProducts = Storage.getCart() || [];
        inCartProducts.forEach(item => {
            this.addProductToCart(item);
        });
        this.setCartTotal(inCartProducts);
    }

    cartController(){
        clearCart.addEventListener("click", ()=>{
            this.clearCartItems();
        });
        cartContent.addEventListener("click", (event)=>{
            const className = event.target.classList;
            const id = event.target.dataset.id;
            if(className.contains("fa-chevron-up")){
                this.incerementQuantity(event, id);
                
            }
            else if(className.contains("fa-chevron-down")){
                this.decerementQuantity(event, id);
            } 
            else if(className.contains("fa-trash-alt")){
                this.removeItemFromCart(id);
                this.removeItemFromDOM(event);
            } 
        });

    }

    removeItemFromCart(id){
        inCartProducts = inCartProducts.filter(item => item.id !== Number(id));
        this.setCartTotal(inCartProducts);
        Storage.saveInCart(inCartProducts);
        this.updateButtonText(id);
    }
    removeItemFromDOM(event){
        cartContent.removeChild(event.target.parentElement)
    }

    incerementQuantity(event, id){
        const product = inCartProducts.find(item => item.id === Number(id));
        product.quantity++;
        this.setCartTotal(inCartProducts);
        Storage.saveInCart(inCartProducts);
        event.target.nextElementSibling.innerText = product.quantity;
        // console.log(product);
    }

    decerementQuantity(event, id){
        const product = inCartProducts.find(item => item.id === Number(id));
        if(product.quantity > 1)
            product.quantity--;
        this.setCartTotal(inCartProducts);
        Storage.saveInCart(inCartProducts);
        event.target.previousElementSibling.innerText = product.quantity;
        // console.log(product);
    }

    clearCartItems(){
        inCartProducts.forEach(item => {
            this.removeItemFromCart(item.id);
        });
        while(cartContent.children.length > 0)
            cartContent.removeChild(cartContent.children[0]);
    }

    updateButtonText(id){
        const removing = allBtns.find(btn => Number(btn.dataset.id) === Number(id));
        removing.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            Add to cart`;
        removing.disabled = false;
    }
}

class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getProduct(id){
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id === parseInt(id));
    }

    static saveInCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
        const _cart = JSON.parse(localStorage.getItem("cart"));
        return _cart;
    }
}


function ShowModal(){
    backdrop.style.display = "block";
    cartModal.style.opacity = "1";
    cartModal.style.top = "30%";
}

function CloseModal(){
    backdrop.style.display = "none";
    cartModal.style.opacity = "0";
    cartModal.style.top = "-100%";
}
