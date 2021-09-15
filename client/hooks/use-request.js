import axios from "axios";
import {useState} from 'react';

const useRequest = ({url, method, body, onSuccess}) => {
    const [errors, setErrors] = useState(null);

    const doRequest = async (props = {}) => {
        try {
            const response = await axios[method](url, {...body, ...props});
            setErrors(null);

            if (onSuccess) {
                onSuccess(response.data);
            }
            // this returned data is not used - more like best practice example
            return response.data;
        }
        catch (err) {
            setErrors(
                <div className='alert alert-danger'>
                    <ul className='my-0'>
                        {err.response.data.errors.map(err => {
                            return <li key={err.message}>{err.message}</li>;
                        })}
                    </ul>
                </div>
            );
        }
    }

    return {doRequest, errors};
};

export default useRequest;