export default {
    template: `
    <div class="row justify-content-center align-items-center" style="height: 100vh; background-color: #f8f9fa;">
  <div class="col-md-4">
    <div class="card shadow-lg p-4 rounded-4">
      <h2 class="text-center text-primary mb-4">Create an Account</h2>
      
      <div class="mb-3">
        <label for="email" class="form-label">Email Address</label>
        <input type="text" id="email" class="form-control" v-model="formData.email" placeholder="Enter your email" required>
      </div>
      
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input type="text" id="username" class="form-control" v-model="formData.username" placeholder="Choose a username" required>
      </div>

      <div class="mb-3">
        <label for="pass" class="form-label">Password</label>
        <input type="password" id="pass" class="form-control" v-model="formData.password" placeholder="Create a password" required>
      </div>
      
      <div class="text-center">
        <button class="btn btn-primary btn-lg w-100" @click="addUser">Register</button>
      </div>
    </div>
  </div>
</div>`,
    data: function() {
        return {
            formData:{
                email: "",
                password: "",
                username: ""
            } 
        }
    },
    methods:{
        addUser: function(){
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(this.formData) // the content goes to backend as JSON string
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message)
                this.$router.push('/login')
            })

        }
    }
}