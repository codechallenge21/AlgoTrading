import axios from 'axios';
// const SERVER_URL = "http://127.0.0.1:443";
const SERVER_URL = "http://ec2-18-189-143-46.us-east-2.compute.amazonaws.com:443";

const save_file = async (data) => {
    const saveFile = `${SERVER_URL}/api/upload.php`;

    try {
        let response = await axios.post(saveFile, data);

        if(response.status === 200){
            console.log("Saved script Successfully!");
            return response.data;
        }

    } catch(e){
        alert(e);
    }
}

const run_script = async (data) => {
    const run_script = `${SERVER_URL}/api/run_script.php`;
    console.log(data.type)

    if (data.type == 'start_test') {
        try {
            console.log('Server is running your script...')
            let response = await axios.post(run_script, data);
            console.log(response);

            if(response.status === 200){
                return(response.data);
            } else {
                return response;
            }
    
        } catch(e){
            alert(e);
        }

    } 
}

const stop_script = async (data) => {
    const run_script = `${SERVER_URL}/api/stop_script.php`;
    if (data.type == 'stop_test') {
        try {
            console.log('Server is stoping your script...')
            let response = await axios.post(run_script, data);
            
            if(response.status === 200){
                return(response.data);
            }
    
        } catch(e){
            alert(e);
        }
    }
}


export { save_file, run_script, stop_script }