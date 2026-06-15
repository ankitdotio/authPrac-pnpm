import  express  from "express"
import { homePageRouter } from "./Routes/homePage.router.js"
import { project } from "./config/config.js"
import morgan from "morgan"
import { registerRouter } from "./Routes/registerUser.route.js"
import cookieParser from "cookie-parser"
import { refreshToken } from "./controllers/register.controller.js"
import { refreshRouter } from "./Routes/refreshingtoken.route.js"

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use("/",homePageRouter)
app.use("/app",registerRouter)
app.use("/app",refreshRouter)
app.listen(project.server_port,()=>{
    console.log(`-----PORT IS LISTENING ON PORT ${project.server_port}------`)
})

app.use(morgan("dev"))

