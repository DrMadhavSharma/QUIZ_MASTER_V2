export default {
    template: `
<div>
  <div class="container-fluid">
    <!-- Hero Section -->
    <div class="row vh-100 bg-primary text-white d-flex align-items-center justify-content-center text-center" 
      style="background-image: url('https://via.placeholder.com/1500'); background-size: cover; background-position: center;">
      <div class="col">
        <h1 class="display-4 fw-bold" 
          style="animation: bounceIn 1.5s both;">
          WELCOME TO QUIZ MASTER
        </h1>
        <p class="lead mb-4" 
          style="animation: fadeIn 1.5s;">
          Test your knowledge and become the ultimate quiz champion!
        </p>
        <router-link class="btn btn-lg btn-warning" 
          style="animation: pulse 1.5s infinite;" to="/login">Start Quiz</router-link>
      </div>
    </div>

    <!-- Features Section -->
    <div class="row py-5 bg-info text-white">
      <div class="col text-center">
        <h2 class="fw-bold mb-4">Why Choose Quiz Master?</h2>
        <div class="row">
          <div class="col-md-4 mb-4">
            <div class="card border-0 shadow-lg bg-light rounded">
              <div class="card-body">
                <h3 class="card-title text-primary">Interactive Quizzes</h3>
                <p class="card-text">Enjoy interactive quizzes with multiple difficulty levels.</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card border-0 shadow-lg bg-light rounded">
              <div class="card-body">
                <h3 class="card-title text-primary">Real-time Scores</h3>
                <p class="card-text">Track your performance and compete with others in real-time!</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-4">
            <div class="card border-0 shadow-lg bg-light rounded">
              <div class="card-body">
                <h3 class="card-title text-primary">Detailed Analytics</h3>
                <p class="card-text">Gain insights into your strengths and areas to improve.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action Section -->
    <div class="row bg-dark text-white py-5">
      <div class="col text-center">
        <h2 class="fw-bold mb-4">Ready to Challenge Yourself?</h2>
        <p class="lead mb-4">Join thousands of others in the ultimate quiz showdown!</p>
        <router-link class="btn btn-lg btn-success" 
          style="animation: heartBeat 1.5s infinite;" to="/login">Get Started</router-link>
      </div>
    </div>

    <!-- Footer Section -->
    
  </div>
</div`}