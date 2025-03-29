export default {
  data() {
    return {
      userId: this.$route.params.userId,
      graphUrl: '',
      subjectChartUrl: ''
    };
  },
  async created() {
    await this.fetchGraph();
    await this.fetchTotalSubjectChart();

  },
  methods: {
    async fetchGraph() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user/${this.userId}/graph`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const blob = await response.blob();
        this.graphUrl = URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error fetching graph:', error);
      }
    },
    async fetchTotalSubjectChart() {
      try {
        const response = await fetch(`http://127.0.0.1:5000/user/${this.userId}/total_subject_chart`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const blob = await response.blob();
        this.subjectChartUrl = URL.createObjectURL(blob);
      } catch (error) {
        console.error('Error fetching subject chart:', error);
      }
    }
  },
  template: `
  <div class="container py-5">
  <div class="row g-4">
    <!-- User Score Summary Section -->
    <div class="col-lg-6">
      <div class="card shadow-lg border-0">
        <div class="card-header bg-primary text-white text-center">
          <h3 class="mb-0">📊 User Score Summary</h3>
        </div>
        <div class="card-body">
          <h4 class="card-title text-center text-secondary">Quiz Score Overview</h4>
          <div class="d-flex justify-content-center">
            <img :src="graphUrl" alt="Graph" class="img-fluid rounded-3 shadow" v-if="graphUrl" />
            <p v-else class="text-muted">⏳ Loading graph...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Distribution Summary Section -->
    <div class="col-lg-6">
      <div class="card shadow-lg border-0">
        <div class="card-header bg-success text-white text-center">
          <h3 class="mb-0">📚 Quiz Distribution Summary</h3>
        </div>
        <div class="card-body">
          <h4 class="text-center text-secondary">Total Quizzes by Subject (User ID: {{ userId }})</h4>
          <div class="d-flex justify-content-center">
            <img :src="subjectChartUrl" alt="Subject Chart" class="img-fluid rounded-3 shadow" v-if="subjectChartUrl" />
            <p v-else class="text-muted">⏳ Loading subject chart...</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Back to Dashboard Button -->
  <div class="text-center mt-5">
    <router-link to="/dashboard" class="btn btn-outline-primary btn-lg">
      🔙 Back to Quizzes
    </router-link>
  </div>
</div>

`
};
