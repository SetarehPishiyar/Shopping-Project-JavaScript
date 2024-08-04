const cartBtn = document.querySelector(".cart-btn");
const backdrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDOM = document.querySelector(".products-center");
const cartTotalPrice = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
let inCartProducts = [];
import { productsData } from "./product.js";

cartBtn.addEventListener("click", ShowModal);
closeModal.addEventListener("click", CloseModal);
backdrop.addEventListener("click", CloseModal);


document.addEventListener("DOMContentLoaded", ()=>{
    const products = new Products();
    const productsData = products.getProducts();
    const ui = new UI();
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
            const id = btn.dataset.id;
            //console.log(inCartProducts);
            const isInCart = inCartProducts.find(p => p.id === id);
            //console.log(isInCart);
            if(isInCart){
                btn.innerText = "Added to cart";
                btn.disabled = true;
            }
            
            btn.addEventListener("click", (event) => {
                event.target.innerText = "Added to cart";
                event.target.disabled = true;
                const addedProduct = Storage.getProduct(id);
                inCartProducts = [...inCartProducts, {...addedProduct, quantity : 1}];
                Storage.saveInCart(inCartProducts);
                this.setCartTotal(inCartProducts);

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