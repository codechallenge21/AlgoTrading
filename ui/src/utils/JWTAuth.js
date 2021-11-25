import axios from 'axios';
// const SERVER_URL = "http://127.0.0.1:443";
const SERVER_URL = "http://ec2-18-189-143-46.us-east-2.compute.amazonaws.com:443";

const setUserAuth = (token, user) => {
    // HTTP header
    // axios.defaults.headers.common['Authentication'] = `Bearer ${token}`
  
    // localStorage values
    window.localStorage.setItem('token', token)
    window.localStorage.setItem('user', JSON.stringify(user))
  }
  
const login = async (data) => {
    const LOGIN_ENDPOINT = `${SERVER_URL}/api/login.php`;
    console.log('==============LoginAPIfeed', data);

    try {
        let response = await axios.post(LOGIN_ENDPOINT, data);

        if(response.status === 200 && response.data.jwt){

            let jwt = response.data.jwt;
            setUserAuth(jwt, response.data.user);
            // localStorage.setItem("access_token", jwt);
            // localStorage.setItem("expire_at", expire_at);
            
            return response.data;
        }

    } catch(e){
        alert('network connection error');
        console.log(e);
    }
}

const register = async (data) => {
    const SIGNUP_ENDPOINT = `${SERVER_URL}/api/register.php`;
    // console.log('==============registerAPIfeed', data);
    try {
        let response = await axios.post(SIGNUP_ENDPOINT, data);

        if(response.status === 200){
            console.log("Registered user Successfully!")
        }
        
        return response.data;
    } catch(e){
        alert ('network connection error')
        console.log(e);
    }
}

const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
}


export { login, register, logout, setUserAuth }