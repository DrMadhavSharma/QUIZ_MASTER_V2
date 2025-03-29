export default {
    template: `
      <div class="container my-5">
  <h1 class="text-primary mb-4">Admin Summary</h1>
  <div class="row border">
    <div class="text-end my-2">
        <button @click="csvExport" class="btn btn-secondary">Download CSV</button>
    </div>
  </div>

  <!-- Summary Details Section -->
  <div v-if="summaryData" class="card mb-4">
    <div class="card-header bg-info text-white">
      <h2 class="mb-0">Summary Details</h2>
    </div>
    <div class="card-body">
      <ul class="list-group">
        <li v-for="(value, key) in summaryData" :key="key" class="list-group-item d-flex justify-content-between">
          <strong class="text-capitalize">{{ key }}</strong>
          <span>{{ value }}</span>
        </li>
      </ul>
    </div>
  </div>

  <!-- Top Scorer Section -->
  <div v-if="topScorer" class="alert alert-success d-flex align-items-center" role="alert">
    <i class="bi bi-trophy me-2"></i>
    <div>
      <h2 class="mb-1">🏆 Top Scorer</h2>
      <p class="mb-0">{{ topScorer.name }} with <strong>{{ topScorer.points }}</strong> points</p>
    </div>
  </div>

  <!-- Chart Section -->
  <div v-if="chartSrc" class="card mb-4">
    <div class="card-header bg-warning">
      <h2 class="mb-0">📊 Graph</h2>
    </div>
    <div class="card-body text-center">
      <img :src="chartSrc" alt="Admin Summary Chart" class="img-fluid rounded shadow-lg" />
    </div>
  </div>

  <!-- Error Section -->
  <div v-if="error" class="alert alert-danger" role="alert">
    ⚠️ {{ error }}
  </div>
</div>

    `,
    data() {
      return {
        summaryData: null,
        topScorer: null,
        chartSrc: null,
        error: null,
      };
    },
    methods: {
      async fetchAdminSummary() {
        try {
          const response = await fetch('/admin/summary');
          if (!response.ok) {
            throw new Error(`Error fetching summary: ${response.status} - ${response.statusText}`);
          }
          const data = await response.json();
          this.summaryData = data.summary_data;
          this.topScorer = data.top_scorer;
          this.chartSrc = `data:image/png;base64,${data.chart}`;
        } catch (error) {
          this.error = error.message;
          console.error('Error in fetchAdminSummary:', error);
        }
      }, csvExport(){
        fetch('/api/export')
        .then(response => response.json())
        .then(data => {
            window.location.href = `/api/csv_result/${data.id}`
        })
    }
    },
    mounted() {
      this.fetchAdminSummary();
    },
  };
  