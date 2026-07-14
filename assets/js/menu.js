/**
 * menu.js
 * Contains 40+ dynamic menu items and rendering logic.
 */

const menuData = [
    // STARTERS
    { name: "Truffle Parmesan Fries", price: 14, category: "starters", desc: "Hand-cut potatoes, white truffle oil, grated parmesan." },
    { name: "Paneer Tikka", price: 16, category: "starters", desc: "Cottage cheese marinated in yogurt and Indian spices." },
    { name: "Hara Bhara Kebab", price: 12, category: "starters", desc: "Spinach, peas, and potato patties with herbs." },
    { name: "Crispy Corn", price: 10, category: "starters", desc: "Golden fried sweet corn tossed with salt and pepper." },
    { name: "Cheese Balls", price: 12, category: "starters", desc: "Melted cheddar and mozzarella encased in a crispy shell." },
    { name: "Chilli Paneer", price: 15, category: "starters", desc: "Wok-tossed cottage cheese with bell peppers and soy sauce." },
    { name: "Tandoori Mushroom", price: 14, category: "starters", desc: "Button mushrooms roasted in a traditional clay oven." },
    { name: "Dahi Ke Kebab", price: 13, category: "starters", desc: "Hung curd patties infused with cardamom and coriander." },
    
    // MAIN COURSE
    { name: "Paneer Butter Masala", price: 22, category: "mains", desc: "Cottage cheese cubes in a rich tomato and butter gravy." },
    { name: "Shahi Paneer", price: 24, category: "mains", desc: "Royal paneer dish with cashew and cream sauce." },
    { name: "Dal Makhani", price: 18, category: "mains", desc: "Slow-cooked black lentils with butter and cream." },
    { name: "Malai Kofta", price: 20, category: "mains", desc: "Potato and cheese dumplings in a creamy cashew gravy." },
    { name: "Mix Veg", price: 16, category: "mains", desc: "Seasonal vegetables cooked with home-ground spices." },
    { name: "Veg Kolhapuri", price: 18, category: "mains", desc: "Spicy mixed vegetable curry from Maharashtra." },
    { name: "Dum Aloo", price: 17, category: "mains", desc: "Baby potatoes slow-cooked in a yogurt-based gravy." },
    
    // BREADS
    { name: "Butter Naan", price: 4, category: "breads", desc: "Soft, fluffy flatbread brushed with organic butter." },
    { name: "Garlic Naan", price: 5, category: "breads", desc: "Tandoor-baked bread topped with minced garlic and cilantro." },
    { name: "Laccha Paratha", price: 5, category: "breads", desc: "Multi-layered whole wheat bread." },
    { name: "Tandoori Roti", price: 3, category: "breads", desc: "Classic whole wheat bread baked in a clay oven." },
    
    // RICE
    { name: "Veg Biryani", price: 20, category: "rice", desc: "Aromatic basmati rice cooked with vegetables and saffron." },
    { name: "Jeera Rice", price: 8, category: "rice", desc: "Basmati rice tempered with cumin seeds." },
    { name: "Peas Pulao", price: 10, category: "rice", desc: "Fragrant rice cooked with green peas and mild spices." },
    
    // DESSERTS
    { name: "Gulab Jamun", price: 8, category: "desserts", desc: "Deep-fried milk dumplings soaked in rose sugar syrup." },
    { name: "Rasmalai", price: 10, category: "desserts", desc: "Soft cottage cheese patties in thickened, sweetened milk." },
    { name: "Chocolate Lava Cake", price: 12, category: "desserts", desc: "Warm chocolate cake with a molten center." },
    { name: "Rabri", price: 9, category: "desserts", desc: "Sweet, condensed-milk-based dish with nuts." },
    { name: "Gajar Halwa", price: 10, category: "desserts", desc: "Traditional carrot pudding with ghee and dry fruits." },
    
    // DRINKS
    { name: "Virgin Mojito", price: 8, category: "drinks", desc: "Refreshing blend of mint, lime, and soda." },
    { name: "Cold Coffee", price: 7, category: "drinks", desc: "Creamy iced coffee topped with vanilla ice cream." },
    { name: "Mango Shake", price: 8, category: "drinks", desc: "Fresh alphonso mangoes blended with milk." },
    { name: "Fresh Lime Soda", price: 5, category: "drinks", desc: "Sweet or salted lime cooler." },
    { name: "Strawberry Smoothie", price: 9, category: "drinks", desc: "Fresh strawberries blended with yogurt and honey." }
];

document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('menuGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const renderMenu = (category) => {
        menuGrid.innerHTML = '';
        
        const filteredData = category === 'all' 
            ? menuData 
            : menuData.filter(item => item.category === category);

        filteredData.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-info">
                    <div class="menu-title-row">
                        <h4>${item.name}</h4>
                        <span class="menu-price">$${item.price}</span>
                    </div>
                    <p class="menu-desc">${item.desc}</p>
                </div>
            `;
            menuGrid.appendChild(menuItem);
        });
    };

    // Initial render
    if (menuGrid) {
        renderMenu('all');
    }

    // Filter Logic
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderMenu(e.target.getAttribute('data-filter'));
        });
    });
});