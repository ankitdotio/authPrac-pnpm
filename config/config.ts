import "dotenv/config"


if(!process.env.DB_URL){
    throw new Error("ERROR WITH DATABASE URL IN DOTENV FILE")
}
if(!process.env.JWT_SECRET){
    throw new Error("ERROR WITH JWT SECRET IN DOTENV FILE")
}
export const project = {
    db_url : process.env.DB_URL,
    server_port : process.env.PORT,
    jwt_secret : process.env.JWT_SECRET
}