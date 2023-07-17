import { Routes, Route} from 'react-router-dom'
import { useEffect } from 'react'

import { PrivateAdmin } from '.././shared/components'

import '../shared/services/yup/TranslationsYup'
import { useDrawerContext } from '../shared/contexts'
import {
    Dashboard,
    CategoryDetails,
    CategoryList,
    TechniqueDetails,
    TechniqueList,
    DimensionDetails,
    DimensionList,
    LoginAdmin,
    PageNotFound
} from '../pages'

export const AppRoutes = () => {
    const { setDrawerOptions } = useDrawerContext()

    useEffect(() => {
        setDrawerOptions([
            {
                label: 'Página inicial',
                icon: 'home',
                path: '/admin/admin-home'
            },
            {
                label: 'Categorias',
                icon: 'local_offer_icon',
                path: '/admin/category'
            },
            {
                label: 'Técnicas',
                icon: 'brush',
                path: '/admin/technique'
            },
            {
                label: 'Dimensões',
                icon: 'straighten_icon',
                path: '/admin/dimension'
            }
        ])
    }, [])

    return (
        <Routes>
            <Route path='/admin/login' element={<LoginAdmin />} />

            <Route path='/admin/admin-home' element={<PrivateAdmin><Dashboard /></PrivateAdmin>} />

            <Route path='/admin/category' element={<PrivateAdmin><CategoryList /></PrivateAdmin>} />
            <Route path='/admin/category/details/:id' element={<PrivateAdmin><CategoryDetails /></PrivateAdmin>} />

            <Route path='/admin/technique' element={<PrivateAdmin><TechniqueList /></PrivateAdmin>} />
            <Route path='/admin/technique/details/:id' element={<PrivateAdmin><TechniqueDetails /></PrivateAdmin>} />

            <Route path='/admin/dimension' element={<PrivateAdmin><DimensionList /></PrivateAdmin>} />
            <Route path='/admin/dimension/details/:id' element={<PrivateAdmin><DimensionDetails /></PrivateAdmin>} />

            <Route path='*' element={<PageNotFound/>} />
        </Routes>
    )
}