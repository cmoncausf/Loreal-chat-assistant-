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
      img: 'cream.jpg',
      description: `Revitalift Triple Power SPF 30 Day Cream is an anti-aging face moisturizer, formulated with 3 of the top derm-recommended ingredients: Pro-Retinol, Hyaluronic Acid and Vitamin C to reduce wrinkles, firm and brighten in 1 week. After use skin feels smoother, softer, refreshed. Dermatologist tested, suitable for sensitive skin. Paraben free, mineral oil free, dye free, allergy tested. Layers well under makeup. Also available in original fragrance and fragrance free.`
    },
    {
      name: 'L’Oréal Paris Micellar Cleansing Water Complete Cleanser',
      category: 'Cleanser',
      img: 'cleansingwater.webp',
      description: 'Removes makeup, cleanses, and soothes. No harsh rubbing or rinsing.'
    },
    {
      name: 'L’Oréal Paris Age Perfect Hydra Nutrition Honey Eye Gel',
      category: 'Eye Care',
      img: 'shopping.webp',
      description: `Ultra-gentle eye gel with Manuka Honey Extract and nurturing oils, infused with calcium and antioxidants. The de-puffing rollerball wand and cooling formula cushion mature, very dry skin with nourishing moisture. Massages away the look of puffiness, bags, and dark circles to leave eyes looking more youthful and feeling refreshed. Eye treatment gel for mature, very dry skin. Rollerball applicator massages away the look of puffiness, bags, and dark circles. In 8 weeks, puffy bags appear reduced, dark circles appear brighter, eyes look more youthful. Paraben free, mineral oil free, non-sticky. Suitable for sensitive skin. Money back guarantee, up to $24.99 for L'Oreal Paris Age Perfect (sales tax and shipping not refunded; restrictions apply). Size: 0.5 fl oz.`
    },
    {
      name: 'L’Oréal Paris Pure-Clay Cleanser Detox & Brighten',
      category: 'Cleanser',
      img: 'pure-clay.webp',
      description: `Skin Experts created our first range of clay-to-mousse daily cleansers that leave skin looking perfectly clear. Each cleanser is powered by 3 different clays in their pure form and enhanced with a nature-sourced ingredient. Indulgently formulated to seamlessly transform from clay-to-mousse, Pure Clay Cleansers remove everyday impurities without over drying. Pure Clay Cleanser Detox Brighten, with 3 pure clays and charcoal, detoxes and brightens dull, tired skin. Gently cleanses away impurities, energizes dull skin, and brightens. With continued use, skin's overall quality is improved; dull skin appears more radiant and luminous; skin looks more beautiful. Size: 4.4 fl oz.`
    },
    {
      name: 'L’Oréal Paris Collagen Moisture Filler Day/Night Cream',
      category: 'Moisturizer',
      img: 'collagen.webp',
      description: `A dose of intense hydration and natural Collagen in Collagen Filler Moisture Day Lotion and Day/Night Cream is essential for younger-looking skin. Rich moisture instantly restores skin's cushion and bounce. Over time, the powerful natural Collagen helps fill in lines and wrinkles, leaving your skin smooth and plump. Use it for a complete collagen-infused skincare regimen. In just 4 weeks, 78% of women saw filled in wrinkles*. *Based on a consumer evaluation of 50 women. Skin-plumping Collagen face cream restores moisture, skin's cushion and bounce in face. Intense hydration face cream that helps fill in lines and wrinkles. Smooths wrinkles for smoother, plumper face skin. Collagen face cream, dermatologist-tested for gentleness. Packaging may vary; what you receive may not be what is reflected on site.`
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
        <button class="desc-btn" style="margin-top:8px;">${div.classList.contains('show-desc') ? 'Hide Details' : 'Details'}</button>
        <button class="add-btn" style="margin-top:8px;background:#e4002b;color:#fff;border:none;border-radius:4px;padding:6px 12px;cursor:pointer;">${selectedProducts.includes(p.name) ? 'Remove from Routine' : 'Add to Routine'}</button>
        <div class="desc-expanded" style="display:none;margin-top:12px;background:#fff;border:1px solid #ccc;padding:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <strong>${p.name}</strong><br>
          <span>${p.description || 'No description available.'}</span>
        </div>
      `;
      if (selectedProducts.includes(p.name)) div.classList.add('selected');
      // Add to Routine button logic
      const addBtn = div.querySelector('.add-btn');
      if (addBtn) {
        addBtn.onclick = (e) => {
          e.stopPropagation();
          toggleProduct(p.name, div);
          addBtn.textContent = selectedProducts.includes(p.name) ? 'Remove from Routine' : 'Add to Routine';
        };
      }
      // Details button logic (expanded card)
      const descBtn = div.querySelector('.desc-btn');
      const descExpanded = div.querySelector('.desc-expanded');
      if (descBtn && descExpanded) {
        descBtn.onclick = (ev) => {
          ev.stopPropagation();
          if (descExpanded.style.display === 'none') {
            descExpanded.style.display = 'block';
            descBtn.textContent = 'Hide Details';
          } else {
            descExpanded.style.display = 'none';
            descBtn.textContent = 'Details';
          }
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
    const systemPrompt = `You are a friendly, professional L'Oréal product and routine advisor. Answer concisely, in a helpful tone. Include product suggestions when relevant and guide users on application order. Use emojis sparingly to feel warm but professional.`;
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
  // ...existing code...
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
    // Maintain conversation history
    { role: 'system', content: systemPrompt }
  ];

  // Render markdown to HTML (basic)
  function renderMarkdown(md) {
    // Bold
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Lists
    md = md.replace(/(^|\n)(\d+\.) (.+)/g, '$1<li>$2 $3</li>');
    // Paragraphs
    md = md.replace(/\n{2,}/g, '</p><p>');
    // Line breaks
    md = md.replace(/\n/g, '<br>');
    // Wrap lists in <ul>
    md = md.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    return `<p>${md}</p>`;
  }

  function appendMessage(text, cls='assistant'){
    if (!chatEl) return;
    const div = document.createElement('div');
    div.className = `message ${cls}`;
    if(cls === 'assistant') {
      div.innerHTML = renderMarkdown(text);
    } else {
      // Only add 'You:' prefix if not already present
      const cleanText = text.startsWith('You:') ? text.slice(4).trim() : text;
      div.innerHTML = `<strong>You:</strong> ${cleanText}`;
    }
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
      body: JSON.stringify({
        messages,
        max_tokens: 300, // concise answers
        temperature: 0.3 // professional, focused, less verbose
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response.';
  }

    // L'Oréal-focused online search using Cloudflare Worker
    function formatCitations(citations) {
      // Replace URLs with clickable links
      const withLinks = citations.replace(
        /(https?:\/\/[^\s\)]+)/g,
        url => `<a href="${url}" target="_blank">${url}</a>`
      );
      // Split into paragraphs and wrap in <p> tags
      return withLinks
        .split('\n\n')
        .filter(para => para.trim() !== '')
        .map(para => `<p>${para}</p>`)
        .join('');
    }

    async function lorealSearch(query) {
      const searchRes = await fetch(workerUrl + `?q=${encodeURIComponent(query)}`);
      const data = await searchRes.json();
      if (!data.results || data.results.length === 0) {
        // Fallback: show official L'Oréal links
        return `
          <p>No relevant L'Oréal information found online. Here are some official sources you may find useful:</p>
          <ul>
            <li><a href="https://www.loreal.com/en/" target="_blank">L'Oréal Official Website</a></li>
            <li><a href="https://www.lorealparisusa.com/products" target="_blank">L'Oréal Paris Product Catalog</a></li>
            <li><a href="https://www.loreal.com/en/science-and-technology/" target="_blank">L'Oréal Science & Research</a></li>
          </ul>
        `;
      }
      // Format results with clickable links and paragraphs
      const raw = data.results.map(item =>
        `<a href="${item.url}" target="_blank">${item.title}</a><br>${item.snippet}`
      ).join('\n\n');
      return formatCitations(raw);
    }

  if (form && promptInput && chatEl) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const text = promptInput.value.trim();
      if (!text) return;
      // Add user message to history and UI
      messages.push({ role: 'user', content: text });
      appendMessage('You: ' + text, 'user');
      promptInput.value = '';
      setLoading(true);
      // Show thinking indicator
      const thinkingDiv = document.createElement('div');
      thinkingDiv.className = 'message assistant';
      thinkingDiv.innerHTML = '<em>...</em>';
      chatEl.appendChild(thinkingDiv);
      chatEl.scrollTop = chatEl.scrollHeight;
      try {
        // Get OpenAI response with full history
        const reply = await queryWorker(messages);
        // Get real-world info with links/citations
        const citations = await lorealSearch(text);
        // Remove thinking indicator
        thinkingDiv.remove();
        // Add assistant message to history and UI
        messages.push({ role: 'assistant', content: reply });
  appendMessage(reply + '<hr><strong>Sources & Links:</strong><br>' + citations, 'assistant');
      } catch (err) {
        thinkingDiv.remove();
        appendMessage('Sorry, something went wrong. Please try again.', 'assistant');
        console.error(err);
      } finally {
        setLoading(false);
      }
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

