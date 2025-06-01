import api from './api';


export const ListAlerts = (data ) => {
    return api.post('/ProS/ListAlerts', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};

export const SetStatus = (data ) => {
    return api.post('/ProS/SetStatus', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};
export const InfoPat= (data ) => {
    return api.post('/ProS/GetInfoPatMed', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};
export const Accept= (data ) => {
  return api.post('/ProS/AcceptAlert', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
};
export const FinishAlert= (data ) => {
  return api.post('/ProS/FinishAlert', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
};

