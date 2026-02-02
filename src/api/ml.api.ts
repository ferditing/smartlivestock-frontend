import api from './axios';

export const mlHealth = async () => {
  const res = await api.get('/ml/health');
  return res.data;
};

export const predict = async (payload: any) => {
  const res = await api.post('/ml/predict', payload);
  return res.data;
};

export const predictFromText = async (payload: any) => {
  const res = await api.post('/ml/predict_from_text', payload);
  return res.data;
};

export default { mlHealth, predict, predictFromText };
