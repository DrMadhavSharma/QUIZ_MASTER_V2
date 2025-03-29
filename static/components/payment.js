export default {
    template: `
      <div class="container py-5">
        <h1 class="text-center mb-4 text-primary">Welcome to the Quiz Payment Portal</h1>
        <form @submit.prevent="submitPayment" class="card p-4 shadow">
          <div class="mb-3">
            <label for="card_number" class="form-label">Card Number:</label>
            <input type="text" v-model="card_number" class="form-control" required maxlength="16" placeholder="1234 5678 9101 1121" />
          </div>
          
          <div class="mb-3">
            <label for="expiry_date" class="form-label">Expiry Date (MM/YY):</label>
            <input type="text" v-model="expiry_date" class="form-control" required placeholder="MM/YY" />
          </div>
  
          <div class="mb-3">
            <label for="cvv" class="form-label">CVV:</label>
            <input type="text" v-model="cvv" class="form-control" required maxlength="3" placeholder="123" />
          </div>
  
          <div class="mb-3">
            <label for="amount" class="form-label">Amount (USD):</label>
            <input type="number" step="0.01" v-model="amount" class="form-control" required placeholder="Amount" />
          </div>
  
          <button type="submit" class="btn btn-success w-100">Pay Now</button>
        </form>
  
        <div v-if="message" class="alert mt-4" :class="{'alert-success': message.includes('success'), 'alert-danger': message.includes('failure')}">{{ message }}</div>
      </div>
    `,
    data: function() {
      return {
        card_number: '',
        expiry_date: '',
        cvv: '',
        amount: '',
        message: ''
      };
    },
    methods: {
      submitPayment: function() {
        const payload = {
          card_number: this.card_number,
          expiry_date: this.expiry_date,
          cvv: this.cvv,
          amount: this.amount
        };
  
        fetch('/process_payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
          this.message = `Payment ${data.payment_status}`;
        })
        .catch(error => {
          this.message = 'Error processing payment.';
        });
      }
    }
  };
  