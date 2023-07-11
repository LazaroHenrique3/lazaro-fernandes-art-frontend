import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material'

import { CategoryService, IListCategory } from '../../shared/services/api/category/CategoryService'
import { BasePageLayout } from '../../shared/layouts'
import { ListTools } from '../../shared/components'
import { useDebounce } from '../../shared/hooks'
import { Environment } from '../../shared/enviroment'

export const CategoryList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [rows, setRows] = useState<IListCategory[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    //Para adicionar delay na pesquisa
    const { debounce } = useDebounce()
    const navigate = useNavigate()

    //Fazer a pesquisa do input de pesquisa através da URL
    //Toda vez que for digitado um texto será mudado o searchParams da Url
    //Logo o valor vai ser modificado, o que por sua vez executa o useMemo
    //E por fim esse valor será armazenado em 'search'

    const search = useMemo(() => {
        //Pega o parâmetro na URL
        return searchParams.get('search') || ''
    }, [searchParams])

    const page = useMemo(() => {
        //Pega o parâmetro na URL
        return Number(searchParams.get('page') || '1')
    }, [searchParams])

    useEffect(() => {
        setIsLoading(true)

        const fetchData = () => {
            debounce(async () => {
                const result = await CategoryService.getAll(page, search)
                setIsLoading(false)

                if (result instanceof Error) {
                    alert(result.message)
                    return
                }

                setRows(result.data)
                setTotalCount(result.totalCount)
            })
        }

        fetchData()

    }, [search, page])

    //Função de exclusão
    const handleDelete = async (id: number, name: string) => {

        if (confirm(`Realmente deseja apagar "${name}"?`)) {
            const result = await CategoryService.deleteById(id)

            if (result instanceof Error) {
                alert(result.message)
                return
            }

            setRows(oldRows => [
                ...oldRows.filter(oldRow => oldRow.id !== id)
            ])
            alert('Registro apagado com sucesso!')
        }
    }

    return (
        <BasePageLayout
            title="Categorias"
            toolBar={
                <ListTools
                    showSearchInput
                    newButtonText='Nova'
                    searchText={search}
                    onClickNewButton={() => navigate('/category/details/new')}
                    onChangeSearchText={text => setSearchParams({ search: text, page: '1' }, { replace: true })}
                />
            }>

            <TableContainer component={Paper} sx={{ m: 1, width: 'auto' }} >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell size='small' sx={{ fontWeight: 600 }}>Ações</TableCell>
                            <TableCell size='small' sx={{ fontWeight: 600 }}>Id</TableCell>
                            <TableCell size='small' sx={{ fontWeight: 600 }}>Nome</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell size='small'>
                                    <IconButton color='error' onClick={() => handleDelete(row.id, row.name)}>
                                        <Icon>delete</Icon>
                                    </IconButton>

                                    <IconButton color='primary' onClick={() => navigate(`/category/details/${row.id}`)}>
                                        <Icon>edit</Icon>
                                    </IconButton>
                                </TableCell>
                                <TableCell size='small'>{row.id}</TableCell>
                                <TableCell size='small'>{row.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    {totalCount === 0 && !isLoading && (
                        <caption>{Environment.EMPTY_LISTING}</caption>
                    )}
                    <TableFooter>
                        {isLoading && (
                            <TableRow>
                                <TableCell size='small' colSpan={3}>
                                    <LinearProgress variant='indeterminate' />
                                </TableCell>
                            </TableRow>
                        )}

                        {(totalCount > 0 && totalCount > Environment.LINE_LIMIT) && (
                            <TableRow>
                                <TableCell size='small' colSpan={3}>
                                    <Pagination
                                        page={page}
                                        count={Math.ceil(totalCount / Environment.LINE_LIMIT)}
                                        onChange={(e, newPage) => setSearchParams({ search, page: newPage.toString() }, { replace: true })}
                                    />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableFooter>
                </Table>
            </TableContainer>
        </BasePageLayout >
    )
}