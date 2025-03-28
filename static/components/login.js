export default {
    template: `
    <div class="row justify-content-center align-items-center" style="height: 100vh; background-color: #f8f9fa;">
  <div class="col-12 col-md-8 col-lg-4">
    <div class="card shadow-lg border-0 rounded-4">
      <div class="card-body p-5">
        <h2 class="text-center text-primary mb-4">Welcome Back!</h2>
        
        <p v-if="message" class="text-center text-danger">{{ message }}</p>
        <form @submit.prevent="loginUser">
       
          <div class="mb-3">
            <label for="email" class="form-label">Email Address</label>
            <input type="email" class="form-control" id="email" v-model="formData.email" placeholder="name@example.com" required>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" v-model="formData.password" placeholder="Enter your password" required>
          </div>

          <div class="d-grid">
            <button class="btn btn-primary btn-lg" @click="loginUser">Login</button>
          </div>
        </form>
        <p class="text-center mt-3 text-muted">Don't have an account? <router-link class="btn btn-warning me-2" to="/register">Register</router-link></p>
      </div> 
    </div>
  </div>
</div>`,
    data: function() {
        return {
            formData:{
                email: "",
                password: ""
            },
            message: ""
        }
    },
    methods:{
        loginUser: function(){
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(this.formData) // the content goes to backend as JSON string
            })
            .then(response => response.json())
            .then(data => { 
                console.log(data)
                if(Object.keys(data).includes("auth-token")){
                    localStorage.setItem("auth_token", data["auth-token"])
                    localStorage.setItem("id", data.id)
                    localStorage.setItem("username", data.username)
                    if(data.roles.includes('admin')){
                        this.$router.push('/admin')
                    }else{
                        this.$router.push('/dashboard') // redirect('/dashboard') in flask
                    }   
                }
                else{
                    this.message = data.message
                }
            }
            )   
        }
    }
}// template in general is ude to render the html part of the component .
// IN CASE OF COMPONENTS DATA HAS TO BE RETURNED AS FUNCTION.
// formdata is data property(an  object),which is used to clb email & password,not a required step in here.
// methods is manually  triggered fn
// fetch creates promise ,will be caught by response object ,promise is resolved using .then this cycle continues promises are formed and resolved using then
