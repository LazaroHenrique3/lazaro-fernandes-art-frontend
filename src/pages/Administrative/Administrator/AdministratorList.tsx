import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon, IconButton, LinearProgress, Pagination, Paper, Table, TableBody, TableContainer, TableFooter, TableHead, TableRow } from '@mui/material'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { AdministratorService, IListAdministrator } from '../../../shared/services/api/administrator/AdministratorService'
import { BasePageLayout } from '../../../shared/layouts'
import { ListTools } from '../../../shared/components'
import { useDebounce } from '../../../shared/hooks'
import { Environment } from '../../../shared/enviroment'

import { useAuthContext } from '../../../shared/contexts'

import { StyledTableCell, StyledTableRow } from '../../../shared/components/StyledComponents/TableComponents'

export const AdministratorList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const [rows, setRows] = useState<IListAdministrator[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    //Para adicionar delay na pesquisa
    const { debounce } = useDebounce()
    const navigate = useNavigate()

    const { accessLevel } = useAuthContext()

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
                const result = await AdministratorService.getAll(page, search)
                setIsLoading(false)

                if (result instanceof Error) {
                    toast.error(result.message)
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
            const result = await AdministratorService.deleteById(id)

            if (result instanceof Error) {
                toast.error(result.message)
                return
            }

            setRows(oldRows => [
                ...oldRows.filter(oldRow => oldRow.id !== id)
            ])
            toast.success('Registro apagado com sucesso!')
        }
    }

    //Função de gerarPDF
    const handlePDF = async () => {
        const result = await AdministratorService.generatePdf(search)

        if (result instanceof Error) {
            toast.error(result.message)
            return
        }

        // Manipula o buffer do PDF recebido
        const pdfBlob = new Blob([result], { type: 'application/pdf' })

        //Cria uma URL temporária para o blob do PDF
        const pdfUrl = URL.createObjectURL(pdfBlob)

        // Abre o PDF em outra janela
        window.open(pdfUrl, '_blank')

        //Limpa a URL temporária após abrir o PDF para liberar recursos
        URL.revokeObjectURL(pdfUrl)
    }

    return (
        <BasePageLayout
            title="Administradores"
            toolBar={
                <ListTools
                    showSearchInput
                    newButtonText='Novo'
                    searchText={search}
                    onClickNewButton={() => navigate('/admin/administrator/details/new')}
                    onClickPDFButton={() => handlePDF()}
                    onChangeSearchText={text => setSearchParams({ search: text, page: '1' }, { replace: true })}
                />
            }>

            <TableContainer component={Paper} sx={{ m: 1, width: 'auto' }} >
                <Table>
                    <TableHead>
                        <TableRow>
                            {(accessLevel !== undefined && accessLevel === 'Root') && (
                                <StyledTableCell width={100} size='small' sx={{ fontWeight: 600 }}>Ações</StyledTableCell>
                            )}
                            <StyledTableCell size='small' sx={{ fontWeight: 600 }}>Status</StyledTableCell>
                            <StyledTableCell size='small' sx={{ fontWeight: 600 }}>Nome</StyledTableCell>
                            <StyledTableCell size='small' sx={{ fontWeight: 600 }}>Email</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <StyledTableRow key={row.id}>
                                {(accessLevel !== undefined && accessLevel === 'Root') && (
                                    <StyledTableCell size='small'>
                                        <IconButton color='error' onClick={() => handleDelete(row.id, row.name)}>
                                            <Icon>delete</Icon>
                                        </IconButton>

                                        <IconButton color='primary' onClick={() => navigate(`/admin/administrator/details/${row.id}`)}>
                                            <Icon>edit</Icon>
                                        </IconButton>
                                    </StyledTableCell>

                                )}
                                <StyledTableCell size='small'>{row.status}</StyledTableCell>
                                <StyledTableCell size='small'>{row.name}</StyledTableCell>
                                <StyledTableCell size='small'>{row.email}</StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                    {totalCount === 0 && !isLoading && (
                        <caption>{Environment.EMPTY_LISTING}</caption>
                    )}
                    <TableFooter>
                        {isLoading && (
                            <TableRow>
                                <StyledTableCell size='small' colSpan={3}>
                                    <LinearProgress variant='indeterminate' />
                                </StyledTableCell>
                            </TableRow>
                        )}

                        {(totalCount > 0 && totalCount > Environment.LINE_LIMIT) && (
                            <TableRow>
                                <StyledTableCell size='small' colSpan={3}>
                                    <Pagination
                                        page={page}
                                        count={Math.ceil(totalCount / Environment.LINE_LIMIT)}
                                        onChange={(e, newPage) => setSearchParams({ search, page: newPage.toString() }, { replace: true })}
                                    />
                                </StyledTableCell>
                            </TableRow>
                        )}
                    </TableFooter>
                </Table>
            </TableContainer>
        </BasePageLayout >
    )
}