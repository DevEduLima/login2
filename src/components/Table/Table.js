import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Button } from '@mui/material';
import { useMaterialReactTable, MRT_TableContainer as MRTTableContainer } from 'material-react-table';
import ActionMenu from 'components/ActionMenu/ActionMenu';
import DetailsDialog from 'components/ProtocolDetailsDialog/DetailsDialog';
import TableColumns from './tableColumns'; // Importa as configurações das colunas da tabela

const Table = ({
  tableData,
  includeActionColumn = true,
  visibleColumns,
  showSpecialColumns,
  enableRowClick = true,
  customActionMenuOptions,
  actionMenuOptions,
  onMenuItemClick,
 
}) => {
  // Estado para controlar a abertura do diálogo de detalhes do protocolo
  const [isDialogOpen, setDialogOpen] = useState(false);
  // Estado para armazenar o item selecionado para exibir detalhes
  const [selectedItem, setSelectedItem] = useState({});
  // Estado para controlar o índice da página atual
  const [pageIndex, setPageIndex] = useState(0);
  // Estado para controlar o número de linhas por página
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Estado para armazenar o elemento ancora do menu de ação
  const [anchorEl, setAnchorEl] = useState(null);

  // Função para lidar com a mudança do número de linhas por página
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = Number(event.target.value);
    setRowsPerPage(newRowsPerPage);
    setPageIndex(0); // Reset da página para a primeira quando o número de linhas por página muda
    table.setPageSize(newRowsPerPage);
  };

  // Função para lidar com o clique no menu de ação
  const handleMenuClick = (event, rowData) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(rowData);
  };

  // Função para fechar o menu de ação
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  // Função para lidar com o clique em uma linha da tabela
  const handleTableRowClick = (event, row) => {
    if (enableRowClick) {
      const isMenuClick =
        event.target.closest('.MuiIconButton-root') ||
        event.target.closest('.MuiMenuItem-root');
      if (!isMenuClick && !anchorEl) {
        setSelectedItem(row.original);
        setDialogOpen(true);
      }
    }
  };

  // Função para lidar com a página anterior
  const handlePreviousPage = () => {
    const newPageIndex = Math.max(pageIndex - 1, 0);
    setPageIndex(newPageIndex);
    table.setPageIndex(newPageIndex);
  };

  // Verifica se é possível avançar para a próxima página
  const canGoToNextPage = tableData && tableData.length > (pageIndex + 1) * rowsPerPage;

  // Função para lidar com a próxima página
  const handleNextPage = () => {
    if (canGoToNextPage) {
      const newPageIndex = pageIndex + 1;
      setPageIndex(newPageIndex);
      table.setPageIndex(newPageIndex);
    }
  };

  // Ordena os dados da tabela pela data de criação, do mais recente para o mais antigo
  tableData.sort((a, b) => parseInt(b.cod_protocolo) - parseInt(a.cod_protocolo));

  // Configuração das colunas da tabela
  const columns = useMemo(() => {
    return [
      ...Object.values(TableColumns(showSpecialColumns, visibleColumns)).filter((column) => column.show),
      includeActionColumn && {
        accessorKey: 'acao',
        header: 'Ação',
        grow: false,
        size: 30,
        Cell: ({ row }) => (
          <ActionMenu
            onMenuClick={(event) => handleMenuClick(event, row.original)}
            onMenuClose={handleMenuClose}
            onMenuItemClick={onMenuItemClick}
            menuOptions={customActionMenuOptions || actionMenuOptions}
            protocolId={row.original.id}
          />
        ),
        show: !visibleColumns || visibleColumns.includes('acao'),
        muiTableHeadCellProps: {
          align: 'center',
        },
        muiTableBodyCellProps: {
          align: 'center',
        },
      },
    ].filter((column) => column.show);
  }, [includeActionColumn, visibleColumns, onMenuItemClick, showSpecialColumns, customActionMenuOptions, actionMenuOptions, handleMenuClose]);

  // Formata os dados da tabela antes de passá-los para a tabela
  const data = useMemo(() => {
    const formatarHora = tableData.map(item => {
      return {
        ...item,
        data: new Date(item.data).toLocaleDateString(),
        hora_start: item.hora_start ? new Date(`1970-01-01T${item.hora_start}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      };
    });
  
    return formatarHora; // retornando formatarHora diretamente, sem inverter a ordem
  }, [tableData]);
  

  // Configuração e inicialização da tabela usando o hook useMaterialReactTable
  const table = useMaterialReactTable({
    columns,
    data,
    actionMenuOptions,
    initialState: { pagination: { pageIndex, pageSize: rowsPerPage } },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => handleTableRowClick(event, row),
      sx: {
        cursor: 'pointer',
      },
    }),

  });

  // Atualiza o estado da página atual sempre que os protocolos forem recarregados
  useEffect(() => {
    setPageIndex(0);
  }, [tableData]);

  // Renderiza o componente de tabela
  return (
    <div className="container-fluid card px-0 ml-0">
      <div className="row">
        <div className="col w-100">
          <MRTTableContainer table={table} />
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center p-3">
        <div className="d-flex align-items-center">
          <Button
            onClick={handlePreviousPage}
            disabled={pageIndex === 0}
            variant="btn btn-secondary btn-sm"
          >
            Página Anterior
          </Button>
          <span className="mx-2">{`Página ${pageIndex + 1}`}</span>
          <Button
            onClick={handleNextPage}
            disabled={!canGoToNextPage}
            variant="btn btn-secondary btn-sm"
          >
            Próxima Página
          </Button>
        </div>
        <div className=" align-items-center">
          <span className="pr-1 text-center">Linhas por Página:</span>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {/* Diálogo para exibir os detalhes do protocolo */}
      <DetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default Table;
