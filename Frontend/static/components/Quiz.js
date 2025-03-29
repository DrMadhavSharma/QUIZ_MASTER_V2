export default {
    template: `
    <div class="container py-5">
  <!-- Timer and Progress Section -->
  <div v-if="questions.length">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center">
        <h4 class="me-2 text-primary fw-bold">⏳ TIME LEFT:</h4>
        <span class="badge bg-danger fs-4 p-3 shadow">{{ formattedTime }}</span>
      </div>
      <div class="d-flex align-items-center">
        <h5 class="me-2">✅ Questions Attempted:</h5>
        <span class="badge bg-success fs-5 p-2">{{ attemptedQuestions }} / {{ questions.length }}</span>
      </div>
    </div>

    <!-- Question Card -->
    <div class="card shadow-lg border-0 p-4 mb-4">
      <h5 class="fw-bold text-dark mb-4">{{ currentIndex + 1 }}. {{ currentQuestion.text }}</h5>

      <!-- Options Section with Highlight on Hover -->
      <div class="list-group">
        <label
          class="list-group-item list-group-item-action py-3"
          v-for="(option, optIndex) in currentQuestion.options"
          :key="optIndex"
        >
          <input
            type="radio"
            :name="'question-' + currentQuestion.id  "
            :value="optIndex"
            v-model="userAnswers[currentQuestion.id]"
            @change="{setUserAnswer(optIndex),updateAttemptedCount()}"
            class="form-check-input me-2"
          />
          {{ option.text  }}
        </label>
      </div>

      <!-- Navigation Buttons -->
      <div class="d-flex justify-content-between mt-4">
        <button class="btn btn-outline-secondary" @click="prevQuestion" :disabled="currentIndex === 0">
          ⬅️ Previous
        </button>
        <button class="btn btn-primary" @click="nextQuestion" v-if="currentIndex < questions.length - 1">
          Next ➡️
        </button>
        <button class="btn btn-success" @click="submitAnswers" v-if="currentIndex === questions.length - 1">
          ✅ Submit Answers
        </button>
      </div>
    </div>
  </div>

  <!-- No Questions Section -->
  <div v-else class="text-center">
    <p class="text-danger fw-bold">⚠️ No questions available for this quiz.</p>
    <router-link to="/dashboard" class="btn btn-outline-primary">🔙 Back to Quizzes</router-link>
  </div>
</div>


    `,
  
    data() {
      return {
        quiz: {},
        questions: [],
        userAnswers: {},
        timeLeft: 0, // Time in seconds
        timerInterval: null,
        currentIndex: 0,
        timerInterval: null,
        timeLeft: 0,
      };
    }
    ,computed: {
      formattedTime() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      },
      currentQuestion() {
        return this.questions[this.currentIndex] || {};
        
    },
    attemptedQuestions() {
      return Object.keys(this.userAnswers).length;
    },}
    ,
    methods: {
      setUserAnswer(value){
      this.userAnswers[this.questions[this.currentIndex].id] = value;
      this.updateAttemptedCount();
    },
      nextQuestion() {
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++;
      }
    },

    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },updateAttemptedCount() {
      // Tracks every change in user answers
      this.attemptedQuestions = Object.keys(this.userAnswers).length;
    },
    submitAnswers() {  
      clearInterval(this.timerInterval); // Stop the timer
        console.log('Submitting answers...');
        const userId = localStorage.getItem('id'); // Assuming user_id is stored in localStorage
        const quiz_id = this.$route.params.quiz_id;
      
        if (!userId || !quiz_id) {
          console.error('Missing user_id or quiz_id');
          return;
        }
      
        const score = this.calculateScore();
  
        fetch(`/user/${userId}/attempt_quiz/${this.$route.params.quiz_id}`, {
          method: 'POST',
          headers: {
            'Authentication-Token': localStorage.getItem('auth_token'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ score }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            alert(`Error: ${data.error}`);
          } else {
            alert(data.message);
            // Redirect to scores page with quiz_id
            this.$router.push({ path: `/scores/${userId}` });
          }
        })
        .catch(error => console.error('Error submitting quiz:', error));
      },
  
      calculateScore() {
        let score = 0;
        let marks = 0;
        if (this.questions.length<10){
          marks= 10/this.questions.length;
        }
      
        this.questions.forEach((question) => {
          const selectedOptionId = this.userAnswers[question.id];
      
          console.log(`Question: ${question.text}`);
          console.log(`Selected Option ID: ${selectedOptionId}, Correct Option ID: ${question.correct_option}`);
          
          if (selectedOptionId+1 === question.correct_option) {
            console.log("Correct!");
            score++;
          } else {
            console.log("Incorrect!");
          }
        });
        score = score * marks
        console.log(`Final Score: ${score}`);
        
        return score;
      
      
  },
      fetchQuizData() {
        const quizId = this.$route.params.quiz_id;
        fetch(`/api/getquiz?quiz_id=${quizId}`)
        .then(response => {
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(text || 'Failed to fetch quiz data');
            });
          }
          return response.json();
        })
        .then(data => {
          this.quiz = data;
          this.fetchQuestions(quizId);
        })
        .catch(error => console.error('Error fetching quiz data:', error));
            },
            startTimer() {
              if (isNaN(this.timeLeft) || this.timeLeft <= 0) {
                console.error('Invalid quiz duration!');
                return;
              }
            
              if (this.timerInterval) clearInterval(this.timerInterval);
            
              this.timerInterval = setInterval(() => {
                if (this.timeLeft > 0) {
                  this.timeLeft--;
                } else {
                  clearInterval(this.timerInterval);
                  alert('Time is up!');
                  this.submitAnswers();
                }
              }, 1000);
            }
            ,
  
      fetchQuestions(quizId) {
        fetch(`/api/quiz/${quizId}/question`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": localStorage.getItem("auth_token")},
            
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => (this.questions = data))
            .catch((error) => console.error("Error fetching questions:", error));
      },
  
      
  },
  
    mounted() {
      this.fetchQuizData();
      // Get duration from query params and convert to seconds
  const durationMinutes = this.$route.query.duration;
  if (durationMinutes) {
    this.timeLeft = parseInt(durationMinutes) * 60;
    this.startTimer();
  } else {
    console.error('Quiz duration is missing!');
  }
    }
  };
  