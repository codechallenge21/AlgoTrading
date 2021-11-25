import axios from 'axios';
// const SERVER_URL = "http://127.0.0.1:443";
const SERVER_URL = "http://ec2-18-189-143-46.us-east-2.compute.amazonaws.com:443";

const setUserAuth = (token, user) => {
    window.localStorage.setItem('token', token)
    window.localStorage.setItem('user', JSON.stringify(user))
}

const get_script_content = async (data) => {

    const GET_SCRIPT = `${SERVER_URL}/api/get_script.php`;

    try {
        let response = await axios.post(GET_SCRIPT, data);

        if(response.status === 200){
            console.log(response.data.message)
        }
        return response.data;
    } catch(e){
        return (e)
    }
}

const load_scripts = async (data) => {
    const LOAD_SCRIPTS = `${SERVER_URL}/api/load_scripts.php`;

    try {
        let response = await axios.post(LOAD_SCRIPTS, data);

        if(response.status === 200 && response.data.success === 1){
            console.log("Loaded scripts successfully")
        }
        return response.data;
    } catch(e){
        return (e)
    }
}

const login = async (data) => {
    const LOGIN_ENDPOINT = `${SERVER_URL}/api/login.php`;

    try {
        let response = await axios.post(LOGIN_ENDPOINT, data);
        
        if(response.status === 200 && response.data.jwt){

            let jwt = response.data.jwt;
            setUserAuth(jwt, response.data.user);
        }

        return response.data;

    } catch(e){
        return(e);
    }
}

const register = async (data) => {
    const SIGNUP_ENDPOINT = `${SERVER_URL}/api/register.php`;

    try {
        let response = await axios.post(SIGNUP_ENDPOINT, data);

        if(response.status === 200 && response.data.success === 1){
            console.log("Registered user Successfully!")
        }
        return response.data;
    } catch(e){
        return (e)
    }
}

const reset = async (data) => {
    const SIGNUP_ENDPOINT = `${SERVER_URL}/api/reset_psw.php`;

    try {
        let response = await axios.post(SIGNUP_ENDPOINT, data);

        if(response.status === 200){
            console.log("Reset password successfully!")
        }
        return response.data;
    } catch(e){
        return (e)
    }
}

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}


export { login, register, logout, reset, setUserAuth, load_scripts, get_script_content }