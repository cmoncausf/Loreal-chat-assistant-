document.addEventListener('DOMContentLoaded', function() {
  // Product search bar elements
  const productSearchInput = document.getElementById('productSearch');
  const categorySearchSelect = document.getElementById('categorySearch');
  // Load selected products from localStorage
  let selectedProducts = JSON.parse(localStorage.getItem('selectedProducts') || '[]');
  const workerUrl = 'https://lingering-sun-d0a7.carlosm4.workers.dev/';
  const systemPrompt = `You are an expert advisor representing L'Oréal. Respond with the authority, expertise, and professionalism of a senior L'Oréal beauty consultant. You ONLY answer questions about L'Oréal products and routines. If a user asks about anything unrelated to L'Oréal products or routines, politely refuse and say: 'Sorry, I can only answer questions about L'Oréal products and routines.'

Your answers should:
- Reference L'Oréal's scientific research, innovation, and commitment to beauty.
- Provide detailed, brand-aligned product recommendations and routine guidance.
- Explain the benefits and proper application of products, referencing ingredients and results when relevant.
- Use a confident, knowledgeable, and warm tone, as a true L'Oréal expert would.
- Avoid emojis unless they enhance clarity or warmth.
`;

  // DOM elements
  const grid = document.getElementById('productGrid');
  const selectedList = document.getElementById('selectedList');
  const searchInput = document.getElementById('search');
  const categorySelect = document.getElementById('category');
  const generateBtn = document.getElementById('generate');
  const chatEl = document.getElementById('chat');
  const form = document.getElementById('inputForm');
  const promptInput = document.getElementById('prompt');

  // Real L'Oréal product data
  const products = [
    {
      name: 'L’Oréal Paris Revitalift Derm Intensives 1.5% Pure Hyaluronic Acid Serum',
      category: 'Serum',
      img: '6fb3ffeb-6be6-47cb-8b2e-a4a8e10d3ae5.28f1130d03a01fe25621c32a4152d064.webp',
      description: `A hydrating facial serum that’s derm-validated, non-greasy, fragrance-free, paraben-free, mineral-oil free, non-comedogenic, absorbs quickly and is suitable for all skin types.\n\nRevitalift Derm Intensives 1.5% Pure Hyaluronic Acid Serum is our most potent hydrating formula with our highest concentration of pure hyaluronic acid. So effective, it immediately hydrates, plumps skin in 1 week, and reduces wrinkles.`
    },
    {
      name: 'L’Oréal Paris Revitalift Triple Power Day Lotion SPF 30',
      category: 'Moisturizer',
      img: 'https://www.lorealparisusa.com/-/media/project/loreal/brand-sites/oap/americas/us/products/skin-care/moisturizer/revitalift-triple-power-day-lotion-spf-30/3600523618144_packshot.png',
    },
    {
      name: 'L’Oréal Paris Micellar Cleansing Water Complete Cleanser',
      category: 'Cleanser',
      img: 'https://www.lorealparisusa.com/-/media/project/loreal/brand-sites/oap/americas/us/products/skin-care/cleanser/micellar-cleansing-water-complete-cleanser/3600523618151_packshot.png',
    },
    {
      name: 'L’Oréal Paris Age Perfect Hydra Nutrition Honey Eye Gel',
      category: 'Eye Care',
      img: 'https://www.lorealparisusa.com/-/media/project/loreal/brand-sites/oap/americas/us/products/skin-care/eye-care/age-perfect-hydra-nutrition-honey-eye-gel/3600523618168_packshot.png',
    },
    {
      name: 'L’Oréal Paris Pure-Clay Cleanser Detox & Brighten',
      category: 'Cleanser',
      img: 'https://www.lorealparisusa.com/-/media/project/loreal/brand-sites/oap/americas/us/products/skin-care/cleanser/pure-clay-cleanser-detox-and-brighten/3600523618175_packshot.png',
    },
    {
      name: 'L’Oréal Paris Collagen Moisture Filler Day/Night Cream',
      category: 'Moisturizer',
      img: 'https://www.lorealparisusa.com/-/media/project/loreal/brand-sites/oap/americas/us/products/skin-care/moisturizer/collagen-moisture-filler-day-night-cream/3600523618182_packshot.png',
    }
  ];


  function renderProducts(list) {
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `
        <img src="${p.img}" alt="${p.name}" style="height:100px;">
        <h4>${p.name}</h4>
        <small>${p.category}</small>
        <button class="desc-btn" style="margin-top:8px;">Details</button>
        <div class="desc-modal" style="display:none;position:absolute;z-index:10;background:#fff;border:1px solid #ccc;padding:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);width:260px;max-width:90vw;left:50%;transform:translateX(-50%);">
          <strong>${p.name}</strong><br>
          <span>${p.description || 'No description available.'}</span>
          <br><button class="close-desc" style="margin-top:8px;">Close</button>
        </div>
      `;
      if (selectedProducts.includes(p.name)) div.classList.add('selected');
      div.onclick = (e) => {
        // Only toggle if not clicking the details button
        if (e.target.classList.contains('desc-btn') || e.target.classList.contains('close-desc')) return;
        toggleProduct(p.name, div);
      };
      // Details button logic
      const descBtn = div.querySelector('.desc-btn');
      const descModal = div.querySelector('.desc-modal');
      if (descBtn && descModal) {
        descBtn.onclick = (ev) => {
          ev.stopPropagation();
          descModal.style.display = 'block';
        };
        descModal.querySelector('.close-desc').onclick = (ev) => {
          ev.stopPropagation();
          descModal.style.display = 'none';
        };
      }
      grid.appendChild(div);
    });
  }

  function filterProducts() {
    // Use the separate product search bar if present
    let searchText = '';
    let category = 'All Categories';
    if (productSearchInput) searchText = productSearchInput.value.toLowerCase();
    if (categorySearchSelect) category = categorySearchSelect.value;
    return products.filter(p => {
      const matchesCategory = category === 'All Categories' || p.category === category;
      const matchesText = p.name.toLowerCase().includes(searchText);
      return matchesCategory && matchesText;
    });
  }

  function updateProductGrid() {
    renderProducts(filterProducts());
  }

  if (searchInput) searchInput.addEventListener('input', updateProductGrid);
  if (categorySelect) categorySelect.addEventListener('change', updateProductGrid);
  // Product search bar listeners
  if (productSearchInput) productSearchInput.addEventListener('input', updateProductGrid);
  if (categorySearchSelect) categorySearchSelect.addEventListener('change', updateProductGrid);

  function toggleProduct(name, el) {
    if (selectedProducts.includes(name)) {
      selectedProducts = selectedProducts.filter(p => p !== name);
      el.classList.remove('selected');
    } else {
      selectedProducts.push(name);
      el.classList.add('selected');
    }
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    renderSelected();
  }

  function renderSelected() {
    if (!selectedList) return;
    if (selectedProducts.length === 0) {
      selectedList.innerHTML = '<em>No products selected.</em>';
      return;
    }
    selectedList.innerHTML = '<ul style="padding:0;">' +
      selectedProducts.map(name => {
        const prod = products.find(p => p.name === name);
        return `<li style="list-style:none;display:flex;align-items:center;margin-bottom:8px;">
          <img src="${prod.img}" alt="${prod.name}" style="height:40px;margin-right:8px;border-radius:4px;">
          <span>${prod.name}</span>
          <button class="remove-selected" style="margin-left:auto;background:#e4002b;color:#fff;border:none;border-radius:4px;padding:2px 8px;cursor:pointer;">Remove</button>
        </li>`;
      }).join('') + '</ul>' +
      `<button id="clearSelected" style="margin-top:8px;background:#888;color:#fff;border:none;border-radius:4px;padding:4px 12px;cursor:pointer;">Clear All</button>`;
    // Remove button logic
    Array.from(selectedList.querySelectorAll('.remove-selected')).forEach((btn, idx) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        selectedProducts.splice(idx, 1);
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
        renderSelected();
        updateProductGrid();
      };
    });
    // Clear all button logic
    const clearBtn = selectedList.querySelector('#clearSelected');
    if (clearBtn) {
      clearBtn.onclick = () => {
        selectedProducts = [];
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
        renderSelected();
        updateProductGrid();
      };
    }
  }

  updateProductGrid();
  // On page load, restore selected state
  renderSelected();

  // Chat logic
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  function appendMessage(text, cls='assistant'){
    if (!chatEl) return;
    const div = document.createElement('div');
    div.className = `message ${cls}`;
    div.textContent = text;
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function setLoading(loading){
    if (!promptInput || !form) return;
    promptInput.disabled = loading;
    form.querySelector('button').disabled = loading;
  }

  async function queryWorker(messages){
    const res = await fetch(workerUrl, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ messages })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response.';
  }

  if (form && promptInput && chatEl) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const text = promptInput.value.trim();
      if (!text) return;
      appendMessage('You: ' + text, 'user');
      promptInput.value = '';
      messages.push({ role: 'user', content: text });
      const reply = await queryWorker(messages);
      appendMessage(reply, 'assistant');
      messages.push({ role: 'assistant', content: reply });
    });
  }

  if (generateBtn && chatEl) {
    generateBtn.onclick = async () => {
      if (selectedProducts.length === 0) {
        appendMessage('Please select at least one product to generate a routine.', 'assistant');
        return;
      }
      const selectedDetails = products.filter(p => selectedProducts.includes(p.name));
      const productList = selectedDetails.map(p => `${p.name} (${p.category})`).join(', ');
      const prompt = `User selected: ${productList}. Generate a complete AM and PM skincare routine using only L'Oréal products. Include product names, order, and tips.`;
      messages.push({ role: 'user', content: prompt });
      appendMessage('Generating routine...', 'assistant');
      setLoading(true);
      try {
        const reply = await queryWorker(messages);
        appendMessage(reply, 'assistant');
        messages.push({ role: 'assistant', content: reply });
      } catch (err) {
        appendMessage('Sorry, something went wrong. Please try again.', 'assistant');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  }

  // allow Enter to submit
  if (promptInput && form) {
    promptInput.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        form.dispatchEvent(new Event('submit',{cancelable:true}));
      }
    });
  }
});

