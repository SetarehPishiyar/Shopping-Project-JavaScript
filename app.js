const cartBtn = document.querySelector(".cart-btn");
const backdrop = document.querySelector(".backdrop");
const cartModal = document.querySelector(".cart");
const closeModal = document.querySelector(".cart-item-confirm");


cartBtn.addEventListener("click", ShowModal);
closeModal.addEventListener("click", CloseModal);
backdrop.addEventListener("click", CloseModal);

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