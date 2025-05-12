/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Array to keep track of selected products */
let selectedProducts = [];

/* Array to keep track of the chat conversation */
let chatHistory = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  return data.products;
}

/* Load selected products from localStorage (if any) */
function loadSelectedProductsFromStorage() {
  const saved = localStorage.getItem("selectedProducts");
  if (saved) {
    try {
      selectedProducts = JSON.parse(saved);
    } catch {
      selectedProducts = [];
    }
  }
}

/* Save selected products to localStorage */
function saveSelectedProductsToStorage() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Remove a product by id from selectedProducts */
function removeSelectedProduct(productId) {
  selectedProducts = selectedProducts.filter((p) => p.id !== productId);
  saveSelectedProductsToStorage();
  updateSelectedProductsList();
  // Also update product card highlights if products are shown
  const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
  if (card) card.classList.remove("selected");
}

/* Clear all selected products */
function clearAllSelectedProducts() {
  selectedProducts = [];
  saveSelectedProductsToStorage();
  updateSelectedProductsList();
  // Remove highlight from all product cards
  document.querySelectorAll(".product-card.selected").forEach(card => card.classList.remove("selected"));
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  // Show product cards with a hidden description overlay
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card${
      selectedProducts.some((p) => p.id === product.id) ? " selected" : ""
    }" 
         data-product-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.brand}</p>
      </div>
      <div class="product-desc-overlay">
        ${product.description}
      </div>
    </div>
  `
    )
    .join("");

  // Add click event listeners to each product card
  const cards = productsContainer.querySelectorAll(".product-card");
  cards.forEach((card) => {
    card.addEventListener("click", () => {
      // Get the product id from the card's data attribute
      const productId = Number(card.getAttribute("data-product-id"));
      // Find the product object by id
      const product = products.find((p) => p.id === productId);
      const index = selectedProducts.findIndex((p) => p.id === productId);

      if (index === -1) {
        // Not selected: add to selectedProducts and highlight
        selectedProducts.push(product);
        card.classList.add("selected");
      } else {
        // Already selected: remove from selectedProducts and un-highlight
        selectedProducts.splice(index, 1);
        card.classList.remove("selected");
      }

      saveSelectedProductsToStorage();
      updateSelectedProductsList();
    });
  });
}

/* Show selected products above the button */
function updateSelectedProductsList() {
  // If none selected, show nothing and hide clear button
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = "";
    const clearBtn = document.getElementById("clearSelectedBtn");
    if (clearBtn) clearBtn.style.display = "none";
    return;
  }

  // Show a small card for each selected product with a remove (X) button
  selectedProductsList.innerHTML = selectedProducts
    .map(
      (product) => `
      <div class="product-card selected" style="flex:0 1 160px; min-height:auto; padding:8px; position:relative;">
        <button class="remove-selected-btn" data-remove-id="${product.id}" style="position:absolute;top:4px;right:4px;background:none;border:none;color:#888;font-size:18px;cursor:pointer;">&times;</button>
        <img src="${product.image}" alt="${product.name}" style="width:50px; height:50px;">
        <div class="product-info" style="min-height:auto;">
          <h3 style="font-size:13px; margin-bottom:4px;">${product.name}</h3>
          <p style="font-size:12px;">${product.brand}</p>
        </div>
      </div>
    `
    )
    .join("");

  // Add remove event listeners to each remove (X) button
  document.querySelectorAll(".remove-selected-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = Number(btn.getAttribute("data-remove-id"));
      removeSelectedProduct(id);
    });
  });

  // Show the clear all button if not already present
  let clearBtn = document.getElementById("clearSelectedBtn");
  if (!clearBtn) {
    clearBtn = document.createElement("button");
    clearBtn.id = "clearSelectedBtn";
    clearBtn.textContent = "Clear All";
    clearBtn.style.margin = "10px 0 0 0";
    clearBtn.style.padding = "8px 16px";
    clearBtn.style.background = "#eee";
    clearBtn.style.border = "1px solid #ccc";
    clearBtn.style.borderRadius = "6px";
    clearBtn.style.cursor = "pointer";
    clearBtn.style.fontSize = "14px";
    clearBtn.addEventListener("click", clearAllSelectedProducts);
    selectedProductsList.parentElement.appendChild(clearBtn);
  }
  clearBtn.style.display = "inline-block";
}

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);
});

/* --- Add a style for selected product cards and description overlay --- */
// This is for demonstration. In real use, add to style.css.
const style = document.createElement("style");
style.innerHTML = `
.product-card.selected {
  border: 2px solid #0078d7;
  background: #eaf6ff;
  cursor: pointer;
}
.product-card {
  cursor: pointer;
  position: relative;
  overflow: visible;
}
.product-desc-overlay {
  display: none;
  position: absolute;
  left: 10px;
  right: 10px;
  top: 10px;
  z-index: 10;
  background: rgba(255,255,255,0.97);
  border: 1.5px solid #0078d7;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.13);
  padding: 16px;
  font-size: 15px;
  color: #222;
  min-width: 220px;
  max-width: 320px;
  min-height: 80px;
  max-height: 220px;
  overflow-y: auto;
  pointer-events: none;
}
.product-card:hover .product-desc-overlay {
  display: block;
}
`;
document.head.appendChild(style);


const OPENAI_PROXY_URL = "https://tiny-leaf-986f.zackaryallen.workers.dev/"; // <-- replace with your deployed Worker URL

/* Function to generate a personalized routine using OpenAI API (via Cloudflare Worker) */
async function generateRoutineWithOpenAI(selectedProducts) {
  // Prepare the prompt for the AI
  const productInfo = selectedProducts
    .map(
      (p, i) =>
        `${i + 1}. ${p.brand} ${p.name} (${p.category}): ${p.description}`
    )
    .join("\n");

  const prompt = `I have selected these skincare and beauty products:\n${productInfo}\n\nPlease create a simple, step-by-step routine using only these products. Explain when and how to use each one.`;

  // Show loading message
  chatWindow.innerHTML = "Generating your personalized routine...";

  // Start a new chat history for this session
  chatHistory = [
    {
      role: "system",
      content: "You are a helpful skincare and beauty advisor. Only answer questions about the generated routine, skincare, haircare, makeup, fragrance, or related beauty topics.",
    },
    { role: "user", content: prompt },
  ];

  try {
    // Send request to your Cloudflare Worker instead of directly to OpenAI
    const response = await fetch(OPENAI_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: chatHistory,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Show the AI's routine in the chat window and add to chat history
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiMessage = data.choices[0].message.content;
      chatWindow.innerHTML = `<strong>Your Personalized Routine:</strong><br><br>${aiMessage.replace(
        /\n/g,
        "<br>"
      )}`;
      // Add AI response to chat history
      chatHistory.push({ role: "assistant", content: aiMessage });
    } else {
      chatWindow.innerHTML =
        "Sorry, I couldn't generate a routine. Please try again.";
    }
  } catch (error) {
    chatWindow.innerHTML =
      "There was an error connecting to the routine service. Please try again.";
  }
}

/* Handle Generate Routine button click */
const generateRoutineBtn = document.getElementById("generateRoutine");
generateRoutineBtn.addEventListener("click", async () => {
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML =
      "Please select at least one product to generate a routine.";
    return;
  }
  await generateRoutineWithOpenAI(selectedProducts);
});

/* Handle follow-up questions in the chatbox */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = document.getElementById("userInput").value.trim();

  // Only allow questions about beauty topics or the routine
  if (!userInput) return;

  // Add user's question to chat history
  chatHistory.push({ role: "user", content: userInput });

  // Show user's question and loading message
  chatWindow.innerHTML += `<br><strong>You:</strong> ${userInput}<br>`;
  chatWindow.innerHTML += "Thinking...";

  try {
    // Send request to your Cloudflare Worker instead of directly to OpenAI
    const response = await fetch(OPENAI_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: chatHistory,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // Show the AI's answer and add to chat history
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const aiMessage = data.choices[0].message.content;
      chatWindow.innerHTML += `<strong>Advisor:</strong> ${aiMessage.replace(
        /\n/g,
        "<br>"
      )}<br>`;
      chatHistory.push({ role: "assistant", content: aiMessage });
    } else {
      chatWindow.innerHTML +=
        "<br>Sorry, I couldn't answer that. Please try again.";
    }
  } catch (error) {
    chatWindow.innerHTML +=
      "<br>There was an error connecting to the routine service. Please try again.";
  }

  // Clear the input box
  document.getElementById("userInput").value = "";
});

/* On page load, restore selected products from localStorage */
loadSelectedProductsFromStorage();
updateSelectedProductsList();
