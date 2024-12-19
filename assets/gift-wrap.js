
// Input element inside the cart drawer creating issues
// hence, using custom web component to address the issue.
// No default submission behaviord due to custom element.


class GiftWrap extends HTMLElement {
    constructor() {
      super();
  
      // Attach shadow DOM to encapsulate styles and markup
      const shadow = this.attachShadow({ mode: 'open' });
  
      shadow.innerHTML = `
        <style>
          .form-checkbox {
            @apply h-5 w-5 text-indigo-600;
          }
          .input-field {
            @apply pl-[15px] block w-full mt-1 h-[40px] border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500;
          }
          .mt-4 {
            margin-top: 1rem;
          }
          .hidden {
            display: none;
          }
        </style>
  
        <!-- Gift wrap option -->
        <label for="giftWrapCheckbox">
          <input type="checkbox" id="giftWrapCheckbox" class="form-checkbox">
          <span>Wrap as a gift? ( + Rs.300 )</span>
        </label>
  
        <!-- Hidden gift wrap form -->
        <div id="giftWrapForm" class="gift-wrap-form hidden">
          <p>
            <label for="to">To</label>
            <input id="to" type="text" placeholder="Recipient's name" class="input-field" name="properties[To]" required />
  
            <label for="from" class="mt-4">From</label>
            <input id="from" type="text" placeholder="Sender's name" class="input-field" name="properties[From]" required />
  
            <label for="gift_message" class="mt-4">Gift Message</label>
            <textarea id="gift_message" placeholder="Type your message" class="input-field" name="properties[Gift Message]" required></textarea>
          </p>
        </div>
      `;
  
      // Get references to the DOM elements inside the shadow DOM
      this._giftWrapCheckbox = shadow.querySelector('#giftWrapCheckbox');
      this._giftWrapForm = shadow.querySelector('#giftWrapForm');
      this._toField = shadow.querySelector('#to');
      this._fromField = shadow.querySelector('#from');
      this._giftMessageField = shadow.querySelector('#gift_message');
  
      // Attach event listener for checkbox toggle
      this._giftWrapCheckbox.addEventListener('change', this._toggleGiftWrapForm.bind(this));
  
      // Bind input event with debounce logic
      this._debouncedHandleFieldChange = this._debounce(this._handleFieldChange.bind(this), 500);
  
      // Event listeners for field changes to update the cart when fields are filled
      this._toField.addEventListener('input', this._debouncedHandleFieldChange);
      this._fromField.addEventListener('input', this._debouncedHandleFieldChange);
      this._giftMessageField.addEventListener('input', this._debouncedHandleFieldChange);
  
      // Track if gift wrap is already in the cart
      this._giftWrapInCart = false;
    }
  
    // Toggle the visibility of the gift wrap form based on checkbox state
    _toggleGiftWrapForm() {
      if (this._giftWrapCheckbox.checked) {
        this._giftWrapForm.classList.remove('hidden'); // Show the form
        this._addGiftWrapToCart();
      } else {
        this._giftWrapForm.classList.add('hidden'); // Hide the form
        this._removeGiftWrapFromCart(); // Remove from cart if unchecked
      }
    }
  
    // Handle adding gift wrap to the cart
    _addGiftWrapToCart() {
      const to = this._toField.value.trim();
      const from = this._fromField.value.trim();
      const giftMessage = this._giftMessageField.value.trim();
  
      // Only add gift wrap to the cart when all fields are filled AND checkbox is checked
      if (this._giftWrapCheckbox.checked && to && from && giftMessage && !this._giftWrapInCart) {
        let formData = {
          'items': [{
            'id': 45021550149801, // Product ID for the main item being added to the cart
            'quantity': 0, // Assuming quantity is 1 for the main item
          }]
        };
  
        // Add the gift wrap item with custom properties
        formData.items.push({
          'id': 45021550149801, // Product ID for your free gift wrap option
          'quantity': 1, // Add 1 quantity of the gift wrap
          'properties': {
            'To': to,
            'From': from,
            'Gift Message': giftMessage
          }
        });
  
        // Make the fetch request to add items to the cart
        fetch(window.Shopify.routes.root + 'cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData) // Send the form data as JSON
        })
        .then(response => response.json())
        .then(data => {
          console.log('Gift wrap added to cart:', data);
          this._giftWrapInCart = true; // Mark that gift wrap is now in the cart
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      } else if (!this._giftWrapCheckbox.checked) {
        console.log('Gift wrap checkbox is not checked. No action taken.');
      } else {
        console.log('Please fill all the gift wrap fields before adding to cart.');
      }
    }
  
    // Function to handle removing the gift wrap from the cart (if unchecked)
    _removeGiftWrapFromCart() {
      let formData = {
        'items': [{
          'id': 45021550149801, // Product ID for your free gift wrap option
          'quantity': 0, // Remove the gift wrap item by setting quantity to 0
        }]
      };
  
      // Make the fetch request to update the cart (removing the gift wrap item)
      fetch(window.Shopify.routes.root + 'cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData) // Send the form data as JSON
      })
      .then(response => response.json())
      .then(data => {
        console.log('Gift wrap removed from cart:', data);
        this._giftWrapInCart = false; // Mark that gift wrap is removed from the cart
      })
      .catch((error) => {
        console.error('Error removing gift wrap:', error);
      });
    }
  
    // Function that checks if all fields are filled and triggers the cart update
    _handleFieldChange() {
      const to = this._toField.value.trim();
      const from = this._fromField.value.trim();
      const giftMessage = this._giftMessageField.value.trim();
  
      // Ensure that all fields are filled and only trigger the cart update once
      if (this._giftWrapCheckbox.checked && to && from && giftMessage && !this._giftWrapInCart) {
        // If checkbox is checked and all fields are filled, add gift wrap
        this._addGiftWrapToCart();
      } else {
        console.log('Please ensure all fields are filled before submitting the gift wrap.');
      }
    }
  
    // Debounce function to limit the rate of firing of the event handler
    _debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  }
  
  // Define the custom element
  customElements.define('gift-wrap', GiftWrap);
  




 
  class GiftWrapEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.giftData = {};
    }
  
    connectedCallback() {
      // Read attributes from the custom element to initialize the gift wrap properties
      this.giftData = {
        to: this.getAttribute('to'),
        from: this.getAttribute('from'),
        message: this.getAttribute('message'),
        lineItemId: this.getAttribute('line-item-id')
      };
  
      // Render the component
      this.render();
  
      // Attach event listeners for editing and updating
      this.shadowRoot.querySelector('.edit-gift-wrap-button').addEventListener('click', () => this.toggleEdit());
      this.shadowRoot.querySelector('.update-gift-wrap-button').addEventListener('click', () => this.updateGiftWrap());
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          .gift-wrap {
            margin-bottom: 15px;
          }
          .gift-wrap-display {
            display: block;
          }
          .gift-wrap-edit {
            display: block; /* Ensure it's shown when toggled */
          }
          .hidden {
            display: none;
          }
          .gift-wrap-button {
            margin-top: 10px;
          }
          input[type="text"], textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            margin-bottom: 10px;
            font-size: 14px;
            border-radius: 4px;
          }
        </style>
  
        <div class="gift-wrap">
          <!-- Display section -->
          <div class="gift-wrap-display">
            <span><strong>To:</strong> <span class="gift-wrap-to">${this.giftData.to}</span></span> /
            <span><strong>From:</strong> <span class="gift-wrap-from">${this.giftData.from}</span></span> /
            <span><strong>Gift Message:</strong> <span class="gift-wrap-message">${this.giftData.message}</span></span>
          </div>
  
          <!-- Editable fields (hidden by default) -->
          <div class="gift-wrap-edit hidden">
            <p><strong>To:</strong><input type="text" class="gift-wrap-to-edit" value="${this.giftData.to}"></p>
            <p><strong>From:</strong><input type="text" class="gift-wrap-from-edit" value="${this.giftData.from}"></p>
            <p><strong>Gift Message:</strong><textarea class="gift-wrap-message-edit">${this.giftData.message}</textarea></p>
          </div>
  
          <!-- Buttons -->
          <button class="edit-gift-wrap-button">Edit</button>
          <button class="update-gift-wrap-button hidden">Update</button>
        </div>
      `;
    }
  
    toggleEdit() {
      console.log('Edit button clicked');
      const displaySection = this.shadowRoot.querySelector('.gift-wrap-display');
      const editSection = this.shadowRoot.querySelector('.gift-wrap-edit');
      const updateButton = this.shadowRoot.querySelector('.update-gift-wrap-button');
      const editButton = this.shadowRoot.querySelector('.edit-gift-wrap-button');
  
      // Toggle visibility of sections
      displaySection.classList.add('hidden');
      editSection.classList.remove('hidden');  // Show editable section
      updateButton.classList.remove('hidden'); // Show the "Update" button
      editButton.classList.add('hidden');      // Hide the "Edit" button
    }
  
    async updateGiftWrap() {
      const updatedTo = this.shadowRoot.querySelector('.gift-wrap-to-edit').value.trim();
      const updatedFrom = this.shadowRoot.querySelector('.gift-wrap-from-edit').value.trim();
      const updatedMessage = this.shadowRoot.querySelector('.gift-wrap-message-edit').value.trim();
  
      // Prepare the data for the AJAX request
      const updatedAttributes = {
        ['gift_to_' + this.giftData.lineItemId]: updatedTo,
        ['gift_from_' + this.giftData.lineItemId]: updatedFrom,
        ['gift_message_' + this.giftData.lineItemId]: updatedMessage
      };
  
      try {
        // Send the updated data to Shopify's cart update endpoint
        const response = await fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attributes: updatedAttributes })
        });
  
        const cart = await response.json();
        console.log('Cart updated:', cart);
  
        // After updating, reflect the changes in the display section
        this.giftData.to = updatedTo;
        this.giftData.from = updatedFrom;
        this.giftData.message = updatedMessage;
  
        this.render();  // Re-render the component with updated data
  
        alert('Gift details updated successfully!');
      } catch (error) {
        console.error('Error updating cart:', error);
        alert('There was an error updating the gift details. Please try again.');
      }
    }
  }
  
  // Register the custom element
  customElements.define('gift-wrap-editor', GiftWrapEditor);
  



//   const giftWrapCheckbox = document.getElementById('giftWrapCheckbox');
//   const giftWrapForm = document.getElementById('giftWrapForm');
//   const toField = document.getElementById('to');
//   const fromField = document.getElementById('from');
//   const giftMessageField = document.getElementById('gift_message');

//   // Show or hide the gift wrap form based on checkbox state
//   giftWrapCheckbox.addEventListener('change', function() {
//     if (giftWrapCheckbox.checked) {
//       giftWrapForm.classList.remove('hidden'); // Show the form
//     } else {
//       giftWrapForm.classList.add('hidden'); // Hide the form
//       removeGiftWrapFromCart(); // Remove gift wrap from the cart if unchecked
//     }
//   });

//   // Debounced function to check if fields are filled and checkbox is checked
//   let debounceTimeout;
//   function handleFieldChange() {
//     // Clear the previous timeout if the user is typing quickly
//     clearTimeout(debounceTimeout);
    
//     // Set a new timeout to wait for the user to stop typing
//     debounceTimeout = setTimeout(() => {
//       const to = toField.value.trim();
//       const from = fromField.value.trim();
//       const giftMessage = giftMessageField.value.trim();

//       if (giftWrapCheckbox.checked && to && from && giftMessage) {
//         addGiftWrapToCart(); // Trigger add to cart when all fields are filled
//       } else {
//         console.log('Waiting for all fields to be filled...');
//       }
//     }, 1000); // 1 second debounce
//   }

//   // Attach the event listeners to all fields
//   toField.addEventListener('input', handleFieldChange);
//   fromField.addEventListener('input', handleFieldChange);
//   giftMessageField.addEventListener('input', handleFieldChange);

//   // Add gift wrap to the cart only when all fields are filled
//   function addGiftWrapToCart() {
//     const to = toField.value.trim();
//     const from = fromField.value.trim();
//     const giftMessage = giftMessageField.value.trim();

//     if (giftWrapCheckbox.checked && to && from && giftMessage) {
//       let formData = {
//         'items': [{
//           'id': 45021550149801, // Product ID for your free gift wrap option
//           'quantity': 1, // Quantity of gift wrap
//           'properties': {
//             'To': to,
//             'From': from,
//             'Gift Message': giftMessage
//           }
//         }]
//       };

//       // Add gift wrap item to the cart
//       fetch(window.Shopify.routes.root + 'cart/add.js', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(formData)
//       })
//       .then(response => response.json())
//       .then(data => {
//         console.log('Gift wrap added to cart:', data);
//       })
//       .catch(error => {
//         console.error('Error adding gift wrap to cart:', error);
//       });
//     } else {
//       console.log('Please fill all fields or check the gift wrap option.');
//     }
//   }

//   // Remove gift wrap from the cart if unchecked
//   function removeGiftWrapFromCart() {
//     let formData = {
//       'items': [{
//         'id': 45021550149801, // Product ID for the free gift wrap option
//         'quantity': 0 // Remove the gift wrap item by setting quantity to 0
//       }]
//     };

//     fetch(window.Shopify.routes.root + 'cart/update.js', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(formData)
//     })
//     .then(response => response.json())
//     .then(data => {
//       console.log('Gift wrap removed from cart:', data);
//     })
//     .catch(error => {
//       console.error('Error removing gift wrap:', error);
//     });
//   }

