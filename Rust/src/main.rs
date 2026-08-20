use actix_web::{get, HttpResponse, web, App, HttpServer, Responder};

#[derive(Serialize, Deserialize)]
struct SignupInput {
    pub username: String,
    pub password: String
}

#[derive(Serialize, Deserialize)]
struct SignupResponse {
    pub message: String,

}

#[get("/hello/{name}")]
async fn greet(name: web::Path<String>) -> impl Responder {
    format!("Hello {}!", name)
}

#[post("/signup")]
async fn signup(body: json<SignupInput>, app_state: web::Data<AppState>) -> impl Responder {
    let mut users = app_state.users.lock().unwrap();
    let mut user_index = app_state.user_index.lock().unwrap();
    
    let user_found = users.iter().find(|u| u.username == body.username);

    if user_found.is_none() {
        *user_index = user_index + 1;

    users.push(User {
        id: user_index.clone(),
        username: body.username.clone(),
        password: body.password.clone()
    });

    drop(users);
    HttpResponse::0k().json(SignupResponse {
        message: String::from("signed up")
    })
    } else {
        HttpResponse::Unauthorized().json(SignupResponse {
            message: String::from("user already exists")
        })
    }
    
    
}

#[post("/signin")]
async fn signin(body: json<SignupInput>, app_state: web::Data<AppState>) -> impl Responder {
    let users = app_state.users.lock().unwrap();

    let user_found = users.iter().find(|u| u.username == body.username && u.password == body.password);

    if user_found.is_some() {
        HttpResponse::Ok().json(SignupResponse {
            message: String::from("signed in")
        })
    } else {
        HttpResponse::Unauthorized().json(SignupResponse {
            message: String::from("invalid credentials")
        })
    }
}

struct User {
    id: u32,
    username: String,
    password: String
}

struct AppState {
    user_index: Mutex<u32>,
    users: Mutex<Vec<User>>
}

#[actix_web::main] // or #[tokio::main]
async fn main() -> std::io::Result<()> {
    let app_state = web::Data::new(AppState{
        users: Mutex::new(vec![]),
        user_index:Mutex::new(0)
    });
    
    HttpServer::new(move || {
        App::new().service(greet)
        App::new()
        .app_data(app_state.clone())
        .service(signup)
        .service(signin)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}