const cartBtn = document.querySelector(".cart-btn");
const backdrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDOM = document.querySelector(".products-center");
const cartTotalPrice = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");

let inCartProducts = [];
import { productsData } from "./product.js";

cartBtn.addEventListener("click", ShowModal);
closeModal.addEventListener("click", CloseModal);
backdrop.addEventListener("click", CloseModal);


document.addEventListener("DOMContentLoaded", ()=>{
    const products = new Products();
    const productsData = products.getProducts();
    const ui = new UI();
    ui.setUpApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    Storage.saveProducts(productsData);
});

class Products{

    getProducts(){
        return productsData;
    }
}

class UI{
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
            add to cart
          </button>
        </div>`;
        });

        productsDOM.innerHTML = result;
    }

    getAddToCartBtns(){
        const addToCartBtn = document.querySelectorAll(".add-to-cart");
        const addToCartBtnArr = [... addToCartBtn];

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
              <i class="fas fa-chevron-up"></i>
              <p>${product.quantity}</p>
              <i class="fas fa-chevron-down"></i>
            </div>
            <i class="fas fa-trash-alt"></i>
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
    cartModal.style.top = "20%";
}

function CloseModal(){
    backdrop.style.display = "none";
    cartModal.style.opacity = "0";
    cartModal.style.top = "-100%";
}