import api from './api';

export const Addp = (data ) => {
    return api.post('/procheaddsupp/addedit', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};
export const Delp = (data ) => {
    return api.post('/procheaddsupp/delete', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};
export const Showp = (data ) => {
    return api.post('/procheaddsupp/recupListContact', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};