import axios from 'axios'

import { errorInterceptor, responseInterceptor } from './interceptors'
import { Environment } from '../../../enviroment'

const api = axios.create({
    baseURL: Environment.URL_BASE
})

//Enquanto não implemento a autenticação
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEsInR5cGVVc2VyIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WzEsMiwzLDQsNV0sImlhdCI6MTY4OTE3Mzc5NCwiZXhwIjoxNjg5MjYwMTk0fQ.zwDpqY2hbETbAD3eTyEsPdIDKoFj0Rtg4rkfxNqMzzs'

api.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`
    return config
})

/* api.interceptors.response.use(
    (response) => responseInterceptor(response),
    (error) => errorInterceptor(error)
) */

export { api }