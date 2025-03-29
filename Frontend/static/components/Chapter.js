export default {
    props: ['subjectId'],  
    data() {
      return {
        chapters: [],
        newChapter: { name: '' },
        isEditing: false,
        editChapterData: {},
      };
    },
    methods: {
      loadChapters() {
        fetch(`/api/subjects/${this.subjectId}/chapters`)
          .then(res => res.json())
          .then(data => {
            this.chapters = data;
          })
          .catch(err => console.error(err));
      },
  
      addChapter() {
        if (!this.newChapter.name.trim()) return alert("Chapter name cannot be empty.");
        
        fetch(`/api/chapters`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: this.newChapter.name, subject_id: this.subjectId }),
        })
        .then(() => {
          this.newChapter.name = '';
          this.loadChapters();
        })
        .catch(err => console.error(err));
      },
  
      editChapter(chapter) {
        this.isEditing = true;
        this.editChapterData = { ...chapter };
      },
  
      updateChapter() {
        fetch(`/api/chapters/${this.editChapterData.id}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: this.editChapterData.name }),
        })
        .then(() => {
          this.isEditing = false;
          this.loadChapters();
        })
        .catch(err => console.error(err));
      },
  
      deleteChapter(id) {
        if (!confirm("Are you sure you want to delete this chapter?")) return;
  
        fetch(`/api/chapters/${id}`, { method: 'DELETE' })
          .then(() => this.loadChapters())
          .catch(err => console.error(err));
      },
    },
  
    mounted() {
      this.loadChapters();
    },
  
    template: `
      <div>
        <h2>Chapters</h2>
        
        <div v-if="isEditing">
          <h4>Edit Chapter</h4>
          <input v-model="editChapterData.name" placeholder="Enter new chapter name" />
          <button @click="updateChapter">Update</button>
          <button @click="isEditing = false">Cancel</button>
        </div>
        
        <div v-else>
          <input v-model="newChapter.name" placeholder="Enter chapter name" />
          <button @click="addChapter">Add Chapter</button>
        </div>
        
        <ul>
          <li v-for="chapter in chapters" :key="chapter.id">
            {{ chapter.name }}
            <button @click="editChapter(chapter)">Edit</button>
            <button @click="deleteChapter(chapter.id)">Delete</button>
          </li>
        </ul>
      </div>
    `
  };
  