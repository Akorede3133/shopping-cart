const cartIcon = document.querySelector('.fa-cart-shopping');
const productDOM = document.querySelector('.products-container .products');
const cartShadow = document.querySelector('.cart-shadow');
const cartDOM = document.querySelector('.cart-container');
const cartTotalCost = document.querySelector('.totalpara');
const cartClearBtn = document.querySelector('.clear-btn');
const closeCartBtn = document.querySelector('.close-icon');
const cartContentContainer = document.querySelector('.cart-content-container');
const totalcartItem = document.querySelector('.total-item');
let cart = [];
let buttonDOM = [];
/*closeCartBtn.addEventListener("click", ()=> {
    cartShadow.classList.remove('show-cart-shadow');
    cartDOM.classList.remove('show-cart-container');
})
cartShadow.addEventListener("click", ()=> {
    cartShadow.classList.remove('show-cart-shadow');
    cartDOM.classList.remove('show-cart-container');
})

cartIcon.addEventListener("click", ()=> {
    cartShadow.classList.add('show-cart-shadow');
    cartDOM.classList.add('show-cart-container');
})*/
class Products {
    async getProducts() {
        try {
            let products = await fetch('products.json');
            let res = await products.json();
            return res;
        } catch (err) {
            console.log(err);
        }
    }
}
class Interface {
    displayProduct(items) {
        items.forEach(item=> {
            let elem = `<article class="item" data-id=${item.id}>
               <div class="img-container">
                    <img src="${item.image}" alt="">
                    <button class="add-to-cart-btn" id="${item.id}">
                        <i class="fa-solid fa-cart-shopping"></i>
                        <span>add to cart</span>
                    </button>
                </div>
                <div class="info">
                    <p class="name">${item.title}</p>
                    <p class="price">$${item.price}</p>
                </div>
            </article>`
            productDOM.insertAdjacentHTML("beforeend", elem);
        })
    }
    getButtons() {
        const addToCartBtns = [...document.querySelectorAll('.add-to-cart-btn')];
        buttonDOM = addToCartBtns;
        addToCartBtns.forEach(btn=> {
            const btnId = btn.id;
            const inCart = cart.find(item=> item.id === btnId);
            if (inCart) {
                btn.textContent = "in cart";
                btn.disabled = true;
            }
            else {
                btn.addEventListener('click', (e)=> {
                    let target = e.currentTarget;
                    target.textContent = "in cart";
                    target.disabled = 'true';
                    //getItem
                    let cartItem = {...this.getItem(btnId), amount: 1};
                    cart = [...cart, cartItem];
                    //save item to localstorage
                    Storage.saveCartToLocalStorage(cart);
                    //save cart values;
                    this.saveCartValues(cart);
                     // add item to cart 
                    this.addToCart(cartItem);
                    //display cart 
                    this.displayCart();
                })
            }
        })
    }
    getItem(id) {
          let products = Storage.getProductsList();
          return products.find(item=> item.id === id);
    }
    saveCartValues(cart) {
        let itemCount = 0;
        let totalPrice = 0;
        cart.map(item=> {
            totalPrice += item.price * item.amount;
            itemCount += item.amount;
        })
        totalPrice = totalPrice.toFixed(2);
        totalcartItem.textContent = itemCount;
        cartTotalCost.textContent = parseFloat(totalPrice);
    }
    displayCart() {
        cartShadow.classList.add('show-cart-shadow');
        cartDOM.classList.add('show-cart-container');
    }
    hideCart() {
        cartShadow.classList.remove('show-cart-shadow');
        cartDOM.classList.remove('show-cart-container');
    }
    addToCart(item) {
                    let elem = `  <div class="cart-content">
                <img src=${item.image} alt="">
                <div class="details">
                    <p>${item.title}</p>
                    <p>$${item.price}</p>
                    <span class="remove" data-id=${item.id}>remove</span>
                </div>
                <div class="controls">
                    <i class="fa-solid fa-chevron-up chevron" data-id=${item.id}></i>
                    <span class="count">${item.amount}</span>
                    <i class="fa-solid fa-chevron-down chevron" data-id=${item.id}></i>
                </div>
            </div>`
            cartContentContainer.insertAdjacentHTML("beforeend", elem);
    }
    setUp() {
        cart = Storage.getCart();
        this.saveCartValues(cart);
        this.populate(cart);
        closeCartBtn.addEventListener('click', this.hideCart);
        cartIcon.addEventListener("click", this.displayCart);
    }
    cartLogic() {
        cartClearBtn.addEventListener('click', ()=> {
            this.clearCart()
        })
        cartContentContainer.addEventListener('click', (e)=> {
            let target =  e.target;
            console.log(target);
            if (target.classList.contains('remove')) {
                let id = target.dataset.id;
                let parent = target.parentElement.parentElement;
                this.removeItem(id);
                parent.remove();
                console.log(cart);
            }
            else if (target.classList.contains('fa-chevron-up')) {
                let id = target.dataset.id;
                let cartItem = cart.find(item=> item.id === id);
                cartItem.amount = cartItem.amount + 1;
                this.saveCartValues(cart);
                Storage.saveCartToLocalStorage(cart);
                target.nextElementSibling.textContent = cartItem.amount;
                console.log(cartItem);
                console.log(cart);
            }
              else if (target.classList.contains('fa-chevron-down')) {
                let id = target.dataset.id;
                let cartItem = cart.find(item=> item.id === id);
                cartItem.amount = cartItem.amount - 1;
                if (cartItem.amount > 0) {
                    this.saveCartValues(cart);
                    Storage.saveCartToLocalStorage(cart);
                    target.previousElementSibling.textContent = cartItem.amount;
                }
                else {
                    let parent = target.parentElement.parentElement;
                    this.removeItem(id);
                    parent.remove();
                }
            }
        });
    }
    populate(cart) {
        cart.forEach(item=> this.addToCart(item));
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        //console.log(cartItems);
        cartItems.forEach(id => this.removeItem(id))
        while (cartContentContainer.children.length > 0) {
            cartContentContainer.removeChild(cartContentContainer.children[0]);
        }
        this.hideCart();
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        Storage.saveCartToLocalStorage(cart);
        this.saveCartValues(cart)
        let button = this.getSingleButton(id);
        let elem = ` <i class="fa-solid fa-cart-shopping"></i>
                        <span>add to cart</span>`;
        button.innerHTML = elem;
        button.disabled = false;
    }
    getSingleButton(id) {
        return buttonDOM.find(item=> item.id === id);
    }
}
class Storage {
   static setLocalStrage(items) {
       localStorage.setItem('products', JSON.stringify(items));
    }
    static getProductsList() {
        return  JSON.parse(localStorage.getItem('products'))
    }
    static saveCartToLocalStorage(cart) {
          localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

window.addEventListener("DOMContentLoaded", ()=> {
    let products = new Products();
    let interface = new Interface();
    //setup
    interface.setUp();
    products.getProducts().then(data=> {
    data = data.items;
    data = data.map(item=> {
        const {id} = item.sys;
         const {title, price} = item.fields
         const image = item.fields.image.fields.file.url;
         return {id, title, price, image};
    })
    //console.log(data);
    interface.displayProduct(data);
    Storage.setLocalStrage(data);
    }).then(()=> {
        interface.getButtons();
        interface.cartLogic();
    })
})