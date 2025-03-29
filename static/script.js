    import Home from './components/home.js'
    import Login from './components/login.js'
    import Register from './components/Register.js'
    import Navbar from './components/navbar.js'
    import Footer from './components/Footer.js'
    import Admin from './components/Admin.js'
    import Dashboard from './components/Dashboard.js'
    import Quiz from './components/Quiz.js'
    import Scores from './components/Scores.js'
    import useRSummary from './components/useRSummary.js'
    import adminSummary from './components/adminSummary.js'
    import payment from './components/payment.js'
    const routes = [
        {path: '/', component: Home},
        {path: '/login', component: Login},
        {path: '/register', component: Register},
        {path: '/dashboard', component: Dashboard},
        {path: '/quiz/:quiz_id', component: Quiz},
        {path: '/scores/:userId', component: Scores},
        {path: '/summary/:userId', component: useRSummary},  //summary page for user to view all users' scores.
        {path: '/adminSummary', component: adminSummary},  //summary page for admin to view all users' scores.
        {path: '/admin', component: Admin},
        {path: '/payment', component: payment} ] // payment page for user to pay for quiz.
    //routes for frontend will be declared here,also contains the name of component that belongs to each specific route .

    const router = new VueRouter({
        routes // routes: routes
    })

    const app = new Vue({
        el: "#app",
        router, // router: router
        template: `                    
        <div class="container">
        <nav-bar :isAdmin="isAdmin"></nav-bar>
        
        <div v-if="isLoading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <router-view v-else></router-view> 
        <foot></foot>
        </div>
        `,
        data: {
            section: "Frontend",
            isLoading: false // Track loading state
        },
        components:{
            "nav-bar": Navbar,
            "foot": Footer
        }//static components nav-bar,foot
        //dynamic components using router view: home,login,register
        ,
        computed: {
            isAdmin() {
                return localStorage.getItem('userRole') === 'admin';
            }
        }
    }) 
    // Show spinner during route transitions
    router.beforeEach((to, from, next) => {
        app.isLoading = true; // Show spinner
        next();
      });
      
      router.afterEach(() => {
        setTimeout(() => {
          app.isLoading = false; // Hide spinner after 10 seconds
        }, 100); // 1 seconds delay
      });
      
      
    // TEMPLATE : it will contain the html that will be rendered in div tag where vue app is mounted.
    //component : object with set of predefined attributes.
    // we use routers in components which keeps changing in itself like center part of a home page,whereas we do not use routers in nav bar as it remains same for 
    // every other page 
    // in here nav-bar is a fixed component  so we directly wrote it's name,whereas router-view a (pre defined fn in vue) will bring the components based on the route
    // like for "/" --- "home" component will be displayed
    // '/login'-----"login" component will be displayed and further..... but will be placed one at a time 