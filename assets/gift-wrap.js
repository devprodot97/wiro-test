
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
       @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
        </style>
  
        <!-- Gift wrap option -->
        <div class="space-y-4">
          <label for="giftWrapCheckbox" class="flex items-center space-x-2">
            <input type="checkbox" id="giftWrapCheckbox" class="form-checkbox">
            <span>Wrap as a gift? ( + Rs.300 )</span>
          </label>
  
          <!-- Hidden gift wrap form -->
          <div id="giftWrapForm" class="gift-wrap-form hidden space-y-4">
            <div class="flex flex-col">
              <label for="to" class="block text-md font-medium text-gray-700">To</label>
              <input id="to" type="text" placeholder="Recipient's name" class="input-field" name="properties[To]" required />
            </div>
  
            <div>
              <label for="from" class="block text-md font-medium text-gray-700 mt-4">From</label>
              <input id="from" type="text" placeholder="Sender's name" class="input-field" name="properties[From]" required />
            </div>
  
            <div>
              <label for="gift_message" class="block text-md font-medium text-gray-700 mt-4">Gift Message</label>
              <textarea id="gift_message" placeholder="Type your message" class="input-field" name="properties[Gift Message]" required></textarea>
            </div>
          </div>
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
  customElements.define('gift-wrap', GiftWrap);

  class GiftWrapEditor extends HTMLElement {
    constructor() {
        super();
        this.giftData = {};  // Stores the gift wrap data
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // Initialize giftData from element attributes
        this.giftData = {
            to: this.getAttribute('to'),
            from: this.getAttribute('from'),
            message: this.getAttribute('message'),
            lineItemId: this.getAttribute('line-item-id')
        };

        // Render the component
        this.render();

        // Bind event listeners
        this.shadowRoot.querySelector('.edit-gift-wrap-button').addEventListener('click', () => this.toggleEdit());
        this.shadowRoot.querySelector('.update-gift-wrap-button').addEventListener('click', () => this.updateGiftWrap());
        this.shadowRoot.querySelector('.gift-wrap-checkbox').addEventListener('change', () => this.handleGiftWrapCheckbox());
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
        @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
        </style>      

        <div class="gift-wrap bg-gray-200 p-8">
            <!-- Gift Wrap Checkbox -->
            <label for="giftWrapCheckbox" class="flex items-center space-x-2">
                <input type="checkbox" id="giftWrapCheckbox" class="gift-wrap-checkbox" checked>
                <div class="flex items-center justify-between w-full">
                <span>Wrap as a gift? (+ Rs.300)</span>
                 <button class="justify-between items-center edit-gift-wrap-button flex"><span class="mr-4">Edit</span> <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
<path d="M4.93613 11.1938L4.68978 10.7587L4.93613 11.1938C5.11516 11.0925 5.25868 10.9486 5.42081 10.7862C5.43165 10.7753 5.44258 10.7644 5.4536 10.7533L11.3119 4.89506L11.3295 4.87747C11.5687 4.63825 11.775 4.43196 11.9257 4.24624C12.0856 4.04918 12.2196 3.83253 12.2692 3.56358C12.3024 3.38371 12.3024 3.19929 12.2692 3.01942C12.2196 2.75048 12.0856 2.53382 11.9257 2.33677C11.775 2.15105 11.5687 1.94475 11.3295 1.70552L11.3119 1.68795L11.2943 1.67035C11.0551 1.43111 10.8488 1.22481 10.6631 1.07411C10.466 0.914205 10.2494 0.780205 9.98041 0.730599C9.80054 0.697424 9.61612 0.697424 9.43626 0.730599C9.16731 0.780205 8.95065 0.914206 8.7536 1.07411C8.56788 1.22481 8.36159 1.43111 8.12237 1.67036L8.10478 1.68795L2.24649 7.54624C2.23547 7.55726 2.22453 7.56818 2.21366 7.57902C2.05119 7.74115 1.90736 7.88467 1.806 8.0637C1.70463 8.24274 1.65556 8.43991 1.60013 8.66264C1.59642 8.67753 1.59269 8.69254 1.58891 8.70766L1.09204 10.6951C1.08983 10.704 1.0876 10.7129 1.08536 10.7218C1.04612 10.8785 1.00421 11.0458 0.990459 11.1864C0.975323 11.3411 0.978851 11.6022 1.18826 11.8116C1.39767 12.021 1.65873 12.0245 1.81346 12.0094C1.954 11.9956 2.12134 11.9537 2.27803 11.9145C2.28696 11.9122 2.29586 11.91 2.30472 11.9078L4.29217 11.4109C4.3073 11.4072 4.3223 11.4034 4.33719 11.3997C4.55993 11.3443 4.7571 11.2952 4.93613 11.1938Z" stroke="#1E1E1E"/>
<path d="M7.625 2.04167L10.125 0.375L12.625 2.875L10.9583 5.375L7.625 2.04167Z" fill="#1E1E1E"/>
</svg></button>
                </div>
                
            </label>

            <!-- Display section -->
            <div class="gift-wrap-display bg-[#F5F5F5] mt-5 text-gray-500 text-md">
                <span><strong>To:</strong> <span class="gift-wrap-to">${this.giftData.to}</span></span> /
                <span><strong>From:</strong> <span class="gift-wrap-from">${this.giftData.from}</span></span> /
                <span><strong>Gift Message:</strong> <span class="gift-wrap-message">${this.giftData.message}</span></span>
            </div>

            <!-- Editable fields (hidden by default) -->
            <div class="gift-wrap-edit hidden">
                <p><strong class="block">To:</strong><input type="text" class="gift-wrap-to-edit w-full" value="${this.giftData.to}"></p>
                <p><strong class="block">From:</strong><input type="text" class="gift-wrap-from-edit w-full" value="${this.giftData.from}"></p>
                <p><strong class="block">Gift Message:</strong><textarea class="gift-wrap-message-edit w-full">${this.giftData.message}</textarea></p>
            </div>

            <!-- Buttons -->
           
            <button class="update-gift-wrap-button hidden w-full text-white bg-black">Update</button>
        </div>
        `;
    }

    // Toggles between the display and edit modes
    toggleEdit() {
        const displaySection = this.shadowRoot.querySelector('.gift-wrap-display');
        const editSection = this.shadowRoot.querySelector('.gift-wrap-edit');
        const updateButton = this.shadowRoot.querySelector('.update-gift-wrap-button');
        const editButton = this.shadowRoot.querySelector('.edit-gift-wrap-button');

        // Toggle visibility of sections
        displaySection.classList.add('hidden');
        editSection.classList.remove('hidden');
        updateButton.classList.remove('hidden');
        editButton.classList.add('hidden');
    }

    // Updates the giftData with the values from the input fields
    updateGiftWrap() {
        const updatedTo = this.shadowRoot.querySelector('.gift-wrap-to-edit').value.trim();
        const updatedFrom = this.shadowRoot.querySelector('.gift-wrap-from-edit').value.trim();
        const updatedMessage = this.shadowRoot.querySelector('.gift-wrap-message-edit').value.trim();

        // Update the giftData variable with the new values
        this.giftData = {
            to: updatedTo,
            from: updatedFrom,
            message: updatedMessage,
            lineItemId: this.giftData.lineItemId // Ensure this is correctly set
        };

        // Log the updated gift data (for debugging purposes)
        console.log('Updated gift data:', this.giftData);

        // Re-render to reflect the updated values in the display section
        this.render();
        
        // Remove the old gift wrap item and then add the new one
        this._removeGiftWrapFromCart().then(() => {
            this._addGiftWrapToCart(updatedTo, updatedFrom, updatedMessage);
        });
    }

    handleGiftWrapCheckbox() {
      const isChecked = this.shadowRoot.querySelector('.gift-wrap-checkbox').checked;
  
      if (!isChecked) {
          // Remove gift wrap from cart if unchecked
          this._removeGiftWrapFromCart();
      } else {
          // Use the stored values from this.giftData to add to the cart
          if (this.giftData) {
              const { to, from, message } = this.giftData;
              this._addGiftWrapToCart(to, from, message);
          } else {
              console.error('Gift data not found. Please ensure updateGiftWrap() has been called first.');
          }
      }
  }

    // Remove the gift wrap from the cart
    _removeGiftWrapFromCart() {
      // Set the quantity of the gift wrap item to 0 to remove it
      let updates = {
          45021550149801: 0 // Product ID for gift wrap
      };
  
      // Step 1: Remove gift wrap from the cart
      return fetch(window.Shopify.routes.root + 'cart/update.js', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ updates })
      })
      .then(response => response.json())
      .then(data => {
          console.log('Gift wrap removed from cart:', data);
  
          // Step 2: Fetch the updated cart page HTML
          return fetch(window.Shopify.routes.root + 'cart');
      })
      .then(response => response.text()) // Get the raw HTML
      // .then(cartHtml => {
      //     console.log('Full cart HTML fetched:', cartHtml);
  
      //     // Step 3: Extract the `.cart-drawer` HTML from the full page HTML
      //     const parser = new DOMParser();
      //     const doc = parser.parseFromString(cartHtml, 'text/html');
      //     const cartDrawerHTML = doc.querySelector('.cart-drawer');
  
      //     if (cartDrawerHTML) {
      //         // Step 4: Update the content inside `.drawer__inner` with the new `.cart-drawer` HTML
      //         this.updateCartHTML(cartDrawerHTML.outerHTML);
      //     } else {
      //         console.error('Could not find .cart-drawer in the fetched HTML.');
      //     }
      // })
      .catch(error => {
          console.error('Error removing gift wrap or updating cart:', error);
      });
  }
  
  // updateCartHTML(cartDrawerHTML) {
  //     // Find the drawer__inner container
  //     const drawerInner = document.querySelector('.drawer__inner');
      
  //     if (!drawerInner) {
  //         console.error('Could not find the drawer__inner container.');
  //         return;
  //     }
  
  //     // Step 5: Replace the existing content inside drawer__inner with the updated .cart-drawer HTML
  //     drawerInner.innerHTML = cartDrawerHTML;
  
  //     // Optional: You can trigger additional actions here (e.g., close the cart drawer)
  //     // closeCartDrawer(); // Example if you want to close the drawer after updating
  // }
  

    // Add the updated gift wrap to the cart
    _addGiftWrapToCart(updatedTo, updatedFrom, updatedMessage) {
        const addFormData = {
            'items': [{
                'id': 45021550149801, // The product ID for the gift wrap item
                'quantity': 1, // Add 1 quantity of the gift wrap
                'properties': {
                    'To': updatedTo,
                    'From': updatedFrom,
                    'Gift Message': updatedMessage
                }
            }]
        };

        // Add the updated gift wrap item
        fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addFormData) // Send the data to add the item back to the cart
        })
        .then(response => response.json())
        .then(data => {
            console.log('Gift wrap added to cart:', data);
        })
        .catch(error => {
            console.error('Error adding gift wrap:', error);
        });
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

