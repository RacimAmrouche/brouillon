import api3 from './api3';

export const AlerteRouge = (data ) => {
    return api3.post('/Start/AlerteSimulationTest', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};

export const AlerteOrange = (data ) => {
    return api3.post('/alertediabete/AlerteDiab', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
};