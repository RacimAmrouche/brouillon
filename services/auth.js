import api from './api';


export const signupPatient = (data ) => {
    return api.post('/auth/signupWithFile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};

export const signupProS = (data ) => {
  return api.post('/auth/signupWithFileProS', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
};

export const signinPatient = (data ) => {
    return api.post('/auth/signinPatient', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
}

export const signinProS = (data ) => {
  return api.post('/auth/signinProS', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
}
export const Logout = (data ) => {
  return api.post('/auth/logout', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
};
export const SendHelp = (data ) => {
  return api.post('/sending/Help', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
};