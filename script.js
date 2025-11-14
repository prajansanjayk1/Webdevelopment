/* script.js — All DOM logic for MiniCommerce
   - Vanilla JS only
   - Dynamic lists: cart, wishlist, reviews
   - Simple registration/login (localStorage simulated)
*/

// ======= Minimal product dataset =======
const PRODUCTS = [
  {id: 'p1', name: 'Wireless Earbuds', price: 1299, img: ''},
  {id: 'p2', name: 'Smart Watch', price: 3499, img: ''},
  {id: 'p3', name: 'Bluetooth Speaker', price: 899, img: ''},
  {id: 'p4', name: 'DSLR Camera', price: 25999, img: ''},
  {id: 'p5', name: 'Gaming Mouse', price: 1499, img: ''},
  {id: 'p6', name: 'Mechanical Keyboard', price: 4999, img: ''}
];

// ======= Simple app state persisted to localStorage =======
const state = {
  cart: JSON.parse(localStorage.getItem('mc_cart') || '[]'),
  wish: JSON.parse(localStorage.getItem('mc_wish') || '[]'),
  reviews: JSON.parse(localStorage.getItem('mc_reviews') || '[]'),
  users: JSON.parse(localStorage.getItem('mc_users') || '[]'),
  loggedIn: JSON.parse(localStorage.getItem('mc_user') || 'null')
};

// ======= Helper utilities =======
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function saveState(){
  localStorage.setItem('mc_cart', JSON.stringify(state.cart));
  localStorage.setItem('mc_wish', JSON.stringify(state.wish));
  localStorage.setItem('mc_reviews', JSON.stringify(state.reviews));
  localStorage.setItem('mc_users', JSON.stringify(state.users));
  localStorage.setItem('mc_user', JSON.stringify(state.loggedIn));
}

// ======= Navigation logic =======
function showSection(id){
  $$('.page-section').forEach(sec => sec.classList.add('hidden'));
  const target = $(`#${id}`);
  if(target) target.classList.remove('hidden');
  // update nav active
  $$('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.section === id));
}

$$('.nav-link').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  const section = a.dataset.section;
  showSection(section);
  // collapse mobile menu
  $('#mobile-nav').classList.add('hidden');
}));

$('#menu-toggle').addEventListener('click', ()=> $('#mobile-nav').classList.toggle('hidden'));
$('#shop-now').addEventListener('click', ()=>{ showSection('products'); window.scrollTo({top:0, behavior:'smooth'}) });

// ======= Product rendering and interactions =======
const productsList = $('#products-list');
const cartItemsEl = $('#cart-items');
const wishItemsEl = $('#wish-items');
const cartCountEl = $('#cart-count');
const wishCountEl = $('#wish-count');
const cartTotalEl = $('#cart-total');

function productCardHTML(product){
  const img = product.img || `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23eef6ff'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%23666'>${encodeURIComponent(product.name)}</text></svg>`;
  return `<div class="product" data-id="${product.id}">
    <img src="${img}" alt="${product.name}">
    <div class="meta"><strong>${product.name}</strong><span>₹${product.price}</span></div>
    <p class="desc">Quick description for ${product.name} — great choice!</p>
    <div class="actions">
      <button class="btn add-cart">Add to Cart</button>
      <button class="btn small add-wish">Add to Wishlist</button>
    </div>
  </div>`;
}

function renderProducts(view='grid', sort='default'){
  let data = PRODUCTS.slice();
  if(sort === 'price-asc') data.sort((a,b)=>a.price-b.price);
  if(sort === 'price-desc') data.sort((a,b)=>b.price-a.price);
  productsList.className = 'products ' + (view==='list' ? 'list' : 'grid');
  productsList.innerHTML = data.map(productCardHTML).join('');
  // attach events
  $$('.add-cart').forEach(btn => btn.addEventListener('click', onAddCart));
  $$('.add-wish').forEach(btn => btn.addEventListener('click', onAddWish));
}

function onAddCart(e){
  const pid = e.target.closest('.product').dataset.id;
  const p = PRODUCTS.find(x=>x.id===pid);
  const found = state.cart.find(i=>i.id===pid);
  if(found) found.qty += 1; else state.cart.push({id:pid,name:p.name,price:p.price,qty:1});
  saveState();
  renderCart();
}

function onAddWish(e){
  const pid = e.target.closest('.product').dataset.id;
  if(!state.wish.includes(pid)) state.wish.push(pid);
  saveState();
  renderWish();
}

function renderCart(){
  cartItemsEl.innerHTML = '';
  let total = 0;
  state.cart.forEach(item=>{
    total += item.price * item.qty;
    const li = document.createElement('li');
    li.innerHTML = `${item.name} — ₹${item.price} × <input class='qty' type='number' value='${item.qty}' min='1' data-id='${item.id}'> <button class='remove' data-id='${item.id}'>Remove</button>`;
    cartItemsEl.appendChild(li);
  });
  cartTotalEl.textContent = total;
  cartCountEl.textContent = state.cart.reduce((s,i)=>s+i.qty,0);
  // attach qty & remove listeners
  $$('#cart-items .qty').forEach(inp => inp.addEventListener('change', e=>{
    const id = e.target.dataset.id; const val = parseInt(e.target.value) || 1;
    const it = state.cart.find(x=>x.id===id); if(it) it.qty = val; saveState(); renderCart();
  }));
  $$('#cart-items .remove').forEach(b=>b.addEventListener('click', e=>{
    const id = e.target.dataset.id; state.cart = state.cart.filter(i=>i.id!==id); saveState(); renderCart();
  }));
}

function renderWish(){
  wishItemsEl.innerHTML = '';
  state.wish.forEach(pid=>{
    const p = PRODUCTS.find(x=>x.id===pid);
    const li = document.createElement('li');
    li.innerHTML = `${p.name} — ₹${p.price} <button class='wish-remove' data-id='${pid}'>Remove</button> <button class='wish-move' data-id='${pid}'>Add to Cart</button>`;
    wishItemsEl.appendChild(li);
  });
  wishCountEl.textContent = state.wish.length;
  $$('.wish-remove').forEach(b=>b.addEventListener('click', e=>{ state.wish = state.wish.filter(x=>x!==e.target.dataset.id); saveState(); renderWish(); }));
  $$('.wish-move').forEach(b=>b.addEventListener('click', e=>{ const id = e.target.dataset.id; const p = PRODUCTS.find(x=>x.id===id); state.cart.push({id:p.id,name:p.name,price:p.price,qty:1}); state.wish = state.wish.filter(x=>x!==id); saveState(); renderCart(); renderWish(); }));
}

// ======= Reviews =====n
function renderReviews(){
  const el = $('#reviews-list'); el.innerHTML = '';
  state.reviews.forEach(r=>{
    const d = document.createElement('div'); d.className='review';
    d.innerHTML = `<strong>${escapeHtml(r.name)}</strong> — <em>${r.rating}/5</em><p>${escapeHtml(r.text)}</p>`;
    el.appendChild(d);
  });
}

function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ======= Contact form handling =======
$('#contact-form').addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('#c-name').value.trim();
  const email = $('#c-email').value.trim();
  const msg = $('#c-message').value.trim();
  if(!name||!email||!msg){ $('#contact-msg').textContent = 'Please fill all fields.'; return; }
  $('#contact-msg').textContent = 'Thanks — we will get back to you soon.';
  $('#contact-form').reset();
});

// ======= Reporting modal =======
$('#open-report').addEventListener('click', ()=> $('#report-modal').classList.remove('hidden'));
$('#close-report').addEventListener('click', ()=> $('#report-modal').classList.add('hidden'));
$('#report-form').addEventListener('submit', e=>{
  e.preventDefault(); $('#rep-msg').textContent = 'Report submitted — our support will contact you.'; $('#report-form').reset(); setTimeout(()=>$('#report-modal').classList.add('hidden'), 1200);
});

// ======= Auth (Registration & Login) =======
$('#open-login').addEventListener('click', ()=> $('#auth-modal').classList.remove('hidden'));
$('#close-auth').addEventListener('click', ()=> $('#auth-modal').classList.add('hidden'));
$('#tab-login').addEventListener('click', ()=> toggleAuth('login'));
$('#tab-register').addEventListener('click', ()=> toggleAuth('register'));

function toggleAuth(mode){
  $('#tab-login').classList.toggle('active', mode==='login');
  $('#tab-register').classList.toggle('active', mode==='register');
  $('#login-form').classList.toggle('hidden', mode!=='login');
  $('#register-form').classList.toggle('hidden', mode!=='register');
}

// Registration validation
$('#do-register').addEventListener('click', ()=>{
  const u = $('#reg-user').value.trim();
  const e = $('#reg-email').value.trim();
  const p = $('#reg-pass').value;
  const p2 = $('#reg-pass2').value;
  const msg = $('#reg-msg'); msg.textContent='';
  if(!u||!e||!p||!p2){ msg.textContent='Please fill all fields.'; return; }
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)){ msg.textContent='Invalid email.'; return; }
  if(p.length < 6){ msg.textContent='Password must be at least 6 chars.'; return; }
  if(p !== p2){ msg.textContent='Passwords do not match.'; return; }
  // check existing
  if(state.users.find(x=>x.email===e || x.username===u)){ msg.textContent='User already exists.'; return; }
  state.users.push({username:u,email:e,password:p}); saveState(); msg.textContent='Registered successfully. You can login now.'; $('#register-form').reset();
});

// Login handling
$('#do-login').addEventListener('click', ()=>{
  const user = $('#login-user').value.trim();
  const pass = $('#login-pass').value;
  const msg = $('#login-msg'); msg.textContent='';
  if(!user||!pass){ msg.textContent='Please enter credentials.'; return; }
  const found = state.users.find(u=> (u.email===user || u.username===user) && u.password===pass );
  if(!found){ msg.textContent='Invalid username/email or password.'; return; }
  state.loggedIn = {username:found.username, email:found.email}; saveState(); msg.textContent = `Welcome, ${found.username}!`; setTimeout(()=>$('#auth-modal').classList.add('hidden'),600);
});

// ======= Reviews form =======
$('#review-form').addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('#r-name').value.trim();
  const rating = $('#r-rating').value;
  const text = $('#r-text').value.trim();
  if(!name||!text){ alert('Please provide name and review.'); return; }
  state.reviews.unshift({name, rating, text, date: new Date().toISOString()}); saveState(); renderReviews(); $('#review-form').reset();
});

// ======= Misc UI events =======
$('#view-cart').addEventListener('click', ()=>{
  document.getElementById('cart-panel').scrollIntoView({behavior:'smooth'});
  showSection('products');
});
$('#view-wishlist').addEventListener('click', ()=>{ showSection('products'); document.getElementById('wish-panel').scrollIntoView({behavior:'smooth'}); });

// Sorting & view
$('#view-mode').addEventListener('change', e=> renderProducts(e.target.value, $('#sort-by').value));
$('#sort-by').addEventListener('change', e=> renderProducts($('#view-mode').value, e.target.value));

// Checkout (simple simulation)
$('#checkout').addEventListener('click', ()=>{
  if(state.cart.length===0){ alert('Cart is empty.'); return; }
  alert('Order placed! Total ₹' + state.cart.reduce((s,i)=>s+i.price*i.qty,0));
  state.cart = []; saveState(); renderCart();
});

// Initialize UI on load
function init(){
  renderProducts(); renderCart(); renderWish(); renderReviews();
  // show home by default
  showSection('home');
}

init();

// end of script.js