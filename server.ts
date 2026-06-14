import  express  from "express"
import { homePageRouter } from "./Routes/homePage.router.js"
import { project } from "./config/config.js"
import morgan from "morgan"
import { registerRouter } from "./Routes/registerUser.route.js"

const app = express()
app.use(express.json())
app.use("/",homePageRouter)
app.use("/app",registerRouter)
app.listen(project.server_port,()=>{
    console.log(`-----PORT IS LISTENING ON PORT ${project.server_port}------`)
})

app.use(morgan("dev"))

