use serde::{Deserialize, Serialize};

pub struct User {
    pub id: u32,
    pub username: String,
    pub password: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: u32,
    pub exp: usize
}