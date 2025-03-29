export default {
  template: `
    <div v-if="user" class="container mt-5">
  <!-- Header Section -->
  <div class="text-center">
    <h1 class="display-3 fw-bold mb-3">🎉 Quiz Results for <span class="text-primary">{{ user }}</span></h1>
    <p class="lead">Total Attempts: <span class="badge bg-info fs-6">{{ totalAttempts }}</span></p>
  </div>

  <!-- Accordion Section for Quiz Results -->
  <div class="row justify-content-center mt-4">
    <div class="col-lg-8">
      <div class="accordion shadow-lg" id="accordionAttempts">
        <div class="accordion-item" v-for="(attempt, index) in attempts" :key="index">
          <h2 class="accordion-header" :id="'heading' + index">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                    :data-bs-target="'#collapse' + index" aria-expanded="false" :aria-controls="'collapse' + index">
              <span class="fw-bold">{{ attempt.quiz_title || 'Quiz Not Found' }}</span> 
              - Score: <span class="text-success">{{ attempt.score }}</span> / 
              <span class="text-warning">{{ attempt.max_score || 'N/A' }}</span> 
              ({{ attempt.percentage || 'N/A' }}%)
            </button>
          </h2>
          <div :id="'collapse' + index" class="accordion-collapse collapse" :aria-labelledby="'heading' + index" data-bs-parent="#accordionAttempts">
            <div class="accordion-body">
              <p><i class="bi bi-calendar-check"></i> <strong>Date Attempted:</strong> {{ attempt.date_attempted }}</p>
              <p><i class="bi bi-clipboard-check"></i> <strong>Score:</strong> {{ attempt.score }} / {{ attempt.max_score || 'N/A' }}</p>
              <p><i class="bi bi-percent"></i> <strong>Percentage:</strong> {{ attempt.percentage || 'N/A' }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Back to Quizzes Button -->
  <div class="text-center mt-5">
    <router-link to="/dashboard" class="btn btn-lg btn-outline-primary shadow-sm">🔙 Back to Quizzes</router-link>
  </div>
</div>

<!-- No Results Section -->
<div v-else-if="message" class="text-center mt-5">
  <h1 class="display-4 text-secondary">😔 {{ message }}</h1>
  <router-link to="/dashboard" class="btn btn-lg btn-outline-secondary mt-3">Go to Quizzes</router-link>
</div>

<!-- Error Section -->
<div v-else-if="error" class="text-center mt-5">
  <h1 class="display-4 text-danger">🚨 {{ error }}</h1>
  <router-link to="/dashboard" class="btn btn-lg btn-outline-secondary mt-3">Go to Quizzes</router-link>
</div>

<!-- Loading Spinner -->
<div v-else class="text-center mt-5">
  <div class="spinner-border text-primary" role="status">
    <span class="visually-hidden">Loading...</span>
  </div>
</div>

  `,

  data() {
    return {
      user: null,
      totalAttempts: 0,
      attempts: [],
      message: '',
      error: '',
    };
  },

  methods: {
    async fetchResults() {
      try {
        const userId = this.$route.params.userId;
        const response = await fetch(`http://127.0.0.1:5000/user/${userId}/dashboard`);
        const result = await response.json();

        if (response.status === 404) {
          this.error = result.error;
        } else if (response.status === 200 && result.message) {
          this.message = result.message;
        } else {
          this.user = result.user;
          this.totalAttempts = result.total_attempts;
          this.attempts = result.attempts;
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        this.error = 'An error occurred while fetching quiz results.';
      }
    },
  },

  mounted() {
    this.fetchResults();
  }
};
