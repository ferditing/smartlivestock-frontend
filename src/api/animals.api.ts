import api from './axios'

export const fetchMyAnimals = async () => {
    // backend exposes farmer animals at GET /api/animal
    const response =  await api.get('/animal');
    return response.data;
}

export const createAnimal = async (payload: {
    species: string;
    breed?: string;
    age?: number;
    weight?: number;
    tag_id?: string;
}) => {
    const res = await api.post('/animal', payload);
    return res.data;
}