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
    jwt_secret : process.env.JWT_SECRET,
    client_id : process.env.CLIENT_ID,
    client_sec : process.env.CLIENT_SEC,
    google_refresh_token : process.env.GOOGLE_REFRESH_TOKEN,
    google_user : process.env.GOOGLE_USER
}