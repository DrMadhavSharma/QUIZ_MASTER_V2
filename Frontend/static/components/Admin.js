export default {
  template: `
<div>

<!-- Existing Content -->
<div>
  <div class="container mt-5">
    <h2>Subjects</h2>
    
    <!-- Add Subject Section -->
    <div class="col-12 text-end  ">
      <button class="btn btn-primary" @click="showAddSubjectForm = !showAddSubjectForm">
        {{ showAddSubjectForm ? 'Cancel' : 'Add Subject' }}
      </button>
    </div>
    
    <div v-if="showAddSubjectForm" class="col-12">
      <input v-model="newSubject.name" type="text" placeholder="Enter Subject Name" class="form-control mb-2" />
      <button @click="addSubject" class="btn btn-success">Add</button>
    </div>
    
    <!-- Subjects and Chapters Section -->
    <div class="row container-fluid bg-gradient bg-info p-4">
  <div class="col-md-6 mb-4" v-for="subject in subjects" :key="subject.id">
    <div class="card shadow-lg border-0">
      <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 class="mb-0">{{ subject.name }}</h5>
        <div>
          <button class="btn btn-warning btn-sm me-2" @click="editSubject(subject)">Edit</button>
          <button class="btn btn-danger btn-sm" @click="deleteSubject(subject.id)">Delete</button>
        </div>
      </div>

      <div class="card-body">
        <h6 class="text-success">Chapters:</h6>
        <input v-model="newChapter.name" type="text" placeholder="Enter Chapter Name" class="form-control mb-2" />
        <button @click="addChapter(subject.id)" class="btn btn-primary btn-sm mb-3">Add Chapter</button>

        <table class="table table-hover table-striped table-bordered" v-if="filteredChapters(subject.id).length">
          <thead class="table-dark">
            <tr>
              <th>Serial No.</th>
              <th>Chapter Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(chapter, index) in filteredChapters(subject.id)" :key="chapter.id">
              <td>{{ index + 1 }}</td>
              <td>{{ chapter.name }}</td>
              <td>
                <button @click="editChapter(chapter)" class="btn btn-sm btn-primary me-1">Edit</button>
                <button @click="deleteChapter(chapter.id, subject.id)" class="btn btn-sm btn-danger me-1">Delete</button>
                <button @click="openQuizModal(chapter)" class="btn btn-sm btn-info">Manage Quizzes</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

        <!-- Quiz Management Modal -->
<div v-if="showQuizModal" class="modal show d-block fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content shadow-lg border-0">
      <div class="modal-header bg-success text-white">
        <h5 class="modal-title">Manage Quizzes for {{ currentChapter ? currentChapter.name : '' }}</h5>
        <button type="button" class="btn-close" @click="showQuizModal = false"></button>
      </div>

      <div class="modal-body">
        <input v-model="newQuiz.title" type="text" placeholder="Quiz Title" class="form-control mb-2" />
        <input v-model="newQuiz.date" type="date" class="form-control mb-2" />
        <input v-model="newQuiz.duration" type="number" placeholder="Duration (minutes)" class="form-control mb-2" />
        <button @click="addQuiz" class="btn btn-success w-100">Add Quiz</button>

        <!-- Quizzes Table -->
        <table class="table table-hover table-striped mt-3" v-if="quizzes.length">
          <thead class="table-primary">
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Duration (min)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quiz in quizzes" :key="quiz.id">
              <td>{{ quiz.title }}</td>
              <td>{{ quiz.date }}</td>
              <td>{{ quiz.duration }}</td>
              <td>
                <button @click="editQuiz(quiz)" class="btn btn-sm btn-warning me-1">Edit</button>
                <button @click="deleteQuiz(quiz.id)" class="btn btn-sm btn-danger me-1">Delete</button>
                <button @click="openQuestionModal(quiz)" class="btn btn-sm btn-info">Manage Questions</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="text-muted text-center mt-3">No quizzes available. Add a new quiz to get started.</p>
      </div>
    </div>
  </div>
</div>

        <!-- Question Management Modal -->
<div v-if="showQuestionModal" class="modal show d-block fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content shadow-lg border-0">
      <!-- Header Section -->
      <div class="modal-header bg-warning text-dark">
        <h5 class="modal-title">Manage Questions for {{ currentQuiz ? currentQuiz.title : '' }}</h5>
        <button type="button" class="btn-close" @click="showQuestionModal_refresh"></button>
      </div>

      <!-- Body Section -->
      <div class="modal-body">
        <!-- Add Question Section -->
        <input v-model="newQuestion.text" type="text" placeholder="Enter Question" class="form-control mb-3" />
        
        <div v-for="(option, index) in newQuestion.options" :key="index">
          <input
            v-model="newQuestion.options[index]"
            type="text"
            :placeholder="'Option ' + (index + 1)"
            class="form-control mb-2"
          />
        </div>

        <input
          v-model="newQuestion.correctOption"
          type="number"
          placeholder="Correct Option (1-4)"
          class="form-control mb-3" min="1" max="4"
        />
        
        <button @click="addQuestion" class="btn btn-success w-100">Add Question</button>

        <!-- Questions Table -->
        <table class="table table-hover table-striped mt-4" v-if="questions.length">
          <thead class="table-success">
            <tr>
              <th>Question</th>
              <th>Options</th>
              <th>Correct Option</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(question, index) in questions" :key="question.id">
              <td>{{ question.text }}</td>
              <td>{{ question.options ? question.options.map(opt => opt.text).join(', ') : 'No Options' }}</td>
              <td>{{ question.correct_option }}</td>
              <td>
                <button @click="toggleEdit(index)" class="btn btn-primary btn-sm me-1">Edit</button>
                <button
                  v-if="currentQuiz && currentQuiz.id"
                  @click="deleteQuestion(index)"
                  class="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else class="text-center text-muted mt-4">No questions available. Add one to get started!</p>
      </div>
    </div>
  </div>
</div>
<!-- Edit Form (Visible Only if Editing) -->
<div v-if="editingIndex !== null" class="modal show d-block fade" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content shadow-lg border-0">
      <!-- Modal Header -->
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">Edit Question</h5>
        <button type="button" class="btn-close" @click="editingIndex = null"></button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <!-- Edit Question Input -->
        <input 
          v-model="questions[editingIndex].text" 
          placeholder="Edit question text" 
          class="form-control mb-3"
        />

        <!-- Edit Options Section -->
        <h6 class="mb-3">Edit Options</h6>
        <div v-for="(option, i) in questions[editingIndex].options" :key="i" class="mb-2">
          <input 
            v-model="option.text" 
            placeholder="Edit option"  
            class="form-control"
          />
        </div>

        <!-- Save Changes Button -->
        <button 
          class="btn btn-success w-100"
          @click="editQuestion(questions[editingIndex])"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</div>

</div>
  `,
  data() {
    return {
      userData: { username: "Admin" },
      subjects: [],
      chapters: [],
      showAddSubjectForm: false,
      showAddChapterForm: false,
      newChapter: {
        name: "",
        subject_id: 0, // Use null for an unset ID
      },
      quiz_id: this.$route.params.quiz_id, // Ensure quiz_id is available
      editChapterData: null,
      newSubject: { name: "" },
      editSubjectData: null,
      quizzes: [],
      questions: [],
      editQuizData: null,
      editQuestionData: null,
      editingIndex: null,
      currentQuiz: {},
      currentQuestion: {},
      showQuizModal: false,
      showQuestionModal: false,
      currentChapter: {},
      newQuiz: { title: "", chapter_id: "", date: "", duration: "" },
      newQuestion: {
        text: '',
        options: ['', '', '', ''], // Pre-initialize with empty strings
        correctOption: null
      },
      refreshKey: 0, // Initial key value

    };
  },

  mounted() {
    this.loadSubjects();
  },
  computed: {
    filteredChapters() {
      return (subjectId) => {
        return this.chapters.filter(
          (chapter) => chapter.subject_id === subjectId
        );
      };
    },
  },

  methods:{showQuestionModal_refresh(){
    this.showQuestionModal = false;
    setTimeout(() => {
      window.location.reload();
    }, 500); // Adjust the delay if needed
  },
    updateOption(index, value) {
      Vue.set(this.newQuestion.options, index, value);
    }
  
,  
    toggleAddSubjectForm() {
      this.showAddSubjectForm = !this.showAddSubjectForm;
    },
    loadSubjects() {
      fetch("/api/adminhome/getsubject", {
        method: "GET",
        headers: { "Authentication-Token": localStorage.getItem("auth_token") },
      })
        .then((response) => response.json())
        .then((data) => {
          if (!Array.isArray(data)) {
            throw new Error("Invalid subject data");
          }

          this.subjects = data;
          console.log("Subjects Loaded:", this.subjects);
          this.chapters = []; // Clear chapters to prevent duplicates
          return Promise.all(
            this.subjects.map((subject) => this.loadChapters(subject.id))
          );
        })
        .then(() => console.log("All chapters loaded successfully"))
        .catch((error) => console.error("Error fetching subjects:", error));
    },

    addSubject() {
      if (!this.newSubject.name) {
        alert("Subject name is required");
        return;
      }

      fetch("/api/adminhome/createsubject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
        body: JSON.stringify(this.newSubject),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add subject");
          }
          return response.json();
        })
        .then(() => {
          this.newSubject.name = "";
          this.showAddSubjectForm = false; // Close the form after adding
          this.loadSubjects(); // Reload subjects
          alert("Subject added successfully!");
        })
        .catch((error) => {
          console.error("Error adding subject:", error);
          alert(error.message || "An error occurred while adding the subject.");
        });
    },
    editSubject(subject) {
      const newName = prompt("Enter new subject name:", subject.name);
      if (newName) {
        fetch(`/api/adminhome/updatesubject/${subject.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
          body: JSON.stringify({ name: newName }),
        })
          .then(() => this.loadSubjects())
          .catch((error) => console.error("Error updating subject:", error));
      }
    },

    deleteSubject(id) {
      if (confirm("Are you sure you want to delete this subject?")) {
        fetch(`/api/adminhome/deletesubject/${id}`, {
          method: "DELETE",
          headers: {
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
        })
          .then(() => this.loadSubjects())
          .catch((error) => console.error("Error deleting subject:", error));
      }
    },
    loadChapters(subjectId) {
      fetch(`/api/adminhome/getchapters/${subjectId}`, {
        method: "GET",
        headers: { "Authentication-Token": localStorage.getItem("auth_token") },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(`Chapters for Subject ${subjectId}:`, data);
          this.chapters = this.chapters.filter(
            (chapter) => chapter.subject_id !== subjectId
          ); // Remove chapters from previous subject before adding new ones
          this.chapters = [...this.chapters, ...data];
        })
        .catch((error) => console.error("Error fetching chapters:", error));
    },

    addChapter(subjectId) {
      if (!this.newChapter.name) {
        alert("Chapter name is required");
        return;
      }

      fetch("/api/adminhome/createchapter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
        body: JSON.stringify({
          name: this.newChapter.name,
          subject_id: subjectId,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add chapter");
          }
          return response.json();
        })
        .then(() => {
          this.newChapter.name = "";
          this.loadChapters(subjectId);
          alert("Chapter added successfully!");
        })
        .catch((error) => console.error("Error adding chapter:", error));
    },

    editChapter(chapter) {
      const newName = prompt("Enter new chapter name:", chapter.name);
      if (newName) {
        fetch(`/api/adminhome/updatechapter/${chapter.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
          body: JSON.stringify({
            name: newName,
            subject_id: chapter.subject_id, // Include subject_id
          }),
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((err) => {
                throw new Error(err.message);
              });
            }
            return response.json();
          })
          .then(() => this.loadChapters(chapter.subject_id))
          .catch((error) => console.error("Error updating chapter:", error));
      }
    },
    deleteChapter(chapterId) {
      if (confirm("Are you sure you want to delete this chapter?")) {
        fetch(`/api/adminhome/deletechapter/${chapterId}`, {
          method: "DELETE",
          headers: {
            "Authentication-Token": localStorage.getItem("auth_token"),
          },
        })
          .then(() => {
            const subjectId = this.chapters.find(
              (ch) => ch.id === chapterId
            )?.subject_id;
            if (subjectId) this.loadChapters(subjectId);
          })
          .catch((error) => console.error("Error deleting chapter:", error));
      }
    },
    openQuizModal(chapter) {
      console.log("Opening quiz modal for Chapter ID:", chapter.id);
      this.currentChapter = chapter;
      this.showQuizModal = true;
      fetch(`/api/getquiz?chapter_id=${chapter.id}`,{
        method: "GET",
        headers: { "Authentication-Token": localStorage.getItem("auth_token") ,
          "Content-Type": "application/json",},
      })
        .then((response) => response.json())
        .then((data) => {
          this.quizzes = Array.isArray(data) ? data : [];
        })
        .catch((error) => console.error("Error fetching quizzes:", error));
    },
    addQuiz() {
      if (!this.newQuiz.title || !this.newQuiz.date || !this.newQuiz.duration) {
        alert("Please fill in all fields.");
        return;
      }
      this.newQuiz.chapter_id = this.currentChapter?.id;
      fetch("/api/createquiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token"),
        },
        body: JSON.stringify(this.newQuiz),
      })
        .then((response) => response.json())
        .then(() => this.fetchQuizzes()) // refreshes the quizes
        .then((data) => {
          if (data && data.id) {
            this.quizzes.push(data);
            this.newQuiz = {
              title: "",
              date: "",
              duration: "",
              chapter_id: this.currentChapter.id,
            };
          }
        })
        .catch((error) => console.error("Error adding quiz:", error));
    },
    editQuiz(quiz) {
      const newTitle = prompt("Enter new quiz title:", quiz.title);
      if (newTitle) {
        fetch(`/api/updatequiz/${quiz.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" ,
          "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify({ title: newTitle }),
        })
          .then((response) => response.json())
          .then(() => this.fetchQuizzes())
          .catch((error) => console.error("Error updating quiz:", error));
      }
    },
    deleteQuiz(quizId) {
      fetch(`/api/deletequiz/${quizId}`, {
        method: "DELETE",
        headers: { "Authentication-Token": localStorage.getItem("auth_token") },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to delete quiz");
          return response.json();
        })
        .then(() => {
          this.quizzes = this.quizzes.filter((q) => q.id !== quizId);
        })
        .catch((error) => console.error("Error deleting quiz:", error));
    },
    fetchQuizzes() {
      fetch(`/api/getquiz?chapter_id=${this.currentChapter.id}`,{
        headers: {
        "Content-Type": "application/json",
        "Authentication-Token": localStorage.getItem("auth_token"),
      },})
        .then((response) => response.json())
        .then((data) => (this.quizzes = data))
        .catch((error) => console.error("Error fetching quizzes:", error));
    },
    openQuestionModal(quiz) {
      this.currentQuiz = quiz;
      this.showQuestionModal = true;
      console.log("Quiz ID:", this.currentQuiz.id);
      fetch(`/api/quiz/${this.currentQuiz.id}/question`, {
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

    addQuestion() {
      if (!this.currentQuiz || !this.currentQuiz.id) {
        console.error("Current quiz is not defined or invalid.");
        return;
      }
    
      if (!this.newQuestion?.text?.trim()) {
        alert("Question text is required.");
        return;
      }
    
      if (!Array.isArray(this.newQuestion.options) || this.newQuestion.options.length < 2 || this.newQuestion.options.length > 4) {
        alert("Please provide 2 to 4 options.");
        return;
      }
    
      const correctOptionIndex = parseInt(this.newQuestion.correctOption, 10);
      if (isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex > this.newQuestion.options.length) {
        alert("Invalid correct option.");
        return;
      }
    
      const requestBody = {
        text: this.newQuestion.text,
        options: this.newQuestion.options,
        correct_option: correctOptionIndex,
      };
    
      fetch(`/api/quiz/${this.currentQuiz.id}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization-Token": localStorage.getItem("auth_token"),
        },
          body: JSON.stringify(requestBody),
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
  console.log('Question Added:', data);

  // Refresh questions for the current quiz
  this.fetchQuestions(this.currentQuiz.id);
  setTimeout(() => {
    alert("Question added successfully!");
  }, 500); // Short delay before proceeding
  // Reset form
  this.newQuestion = {
    text: "",
    options: ["", "", "", ""],
    correctOption: "",
  };
})

        .catch((error) => console.error("Error adding question:", error));
    }
    
,toggleEdit(index) {
  this.editingIndex = index; // Set editingIndex to show the form
  console.log('Editing question at index:', index);
}
,
editQuestion(question) {
  if (!question.option_ids || question.option_ids.length !== question.options.length) {
    question.option_ids = question.options.map((opt) => opt.option_id);
  }

  const updatedOptions = question.options.map((option, index) => ({
    option_id: option.option_id || question.option_ids[index],
    text: option.text,
  }));

  fetch(`/api/questions/${question.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(updatedOptions),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((err) => Promise.reject(err));
      }
      return response.json();
    })
    .then((data) => {
      alert(data.message);
      this.editingIndex = null; // Close the form
    })
    .catch((error) => {
      console.error("Error updating question:", error);
      alert(error.message || "An error occurred while updating the question.");
    });
}

, 
  updateOption(index, value) {
    this.$set(this.newQuestion.options, index, value);
}
, 
deleteQuestion(index) {
  const question = this.questions[index];
  fetch(`/api/questions/${question.id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  })
  .then(response => {
    if (response.ok) {
      this.questions.splice(index, 1);
      console.log("Question deleted successfully.");
    } else {
      response.json().then(data => console.error("Error:", data.message));
    }
  })
  .catch(error => console.error("Error deleting question:", error));
}
,fetchQuestions(quizId) {
  if (!quizId) {
    console.error("Quiz ID is required to fetch questions.");
    return;
  }

  fetch(`/api/quiz/${quizId}/question`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization-Token": localStorage.getItem("auth_token")},
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Fetched Questions:', data);
      this.questions = data; // Assuming API returns a list of questions
    })
    .catch(error => console.error('Error fetching questions:', error));
}



,

    created() {
      this.loadSubjects();
    },
  },
};
