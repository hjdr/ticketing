import axios from "axios";
import { useState } from 'react';

export default ({ body, method, onSuccess, url }) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async () => {
    try {
      const response = await axios[method](url, body);
      setErrors(null);
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>oops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map(err => (
                <li key={err.message}>{err.message}</li>
              )
            )}
          </ul>
        </div>
      )
    }
  }

  return { doRequest, errors };
};
