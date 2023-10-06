import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import { ProjFileDesc, ProjFolder } from '../../utils/models'
import { Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function FileList({ pathUri, folder }: {
  pathUri: string,
  folder: ProjFolder,
}) {
  const getItemIcon = (item: ProjFileDesc) => {
    switch (item?.kind) {
      case 'folder':
        return (<FolderIcon />)
      case 'doc':
        return (<DescriptionIcon />)
      case 'blob':
        return (<FilePresentIcon />)
      default:
        return (<></>)
    }
  }

  const getItemLink = (item: ProjFileDesc) => {
    const to = pathUri + '/' + item?.name
    return (<Link
      underline='hover'
      sx={{ display: 'flex', alignItems: 'left' }}
      color="inherit"
      key={item?.name}
      component={RouterLink}
      to={to}>
      {getItemIcon(item)}
      {item?.name}
    </Link>)
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {folder.items?.map(item => {
            return (
              <TableRow
                key={item?.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {getItemLink(item)}
                </TableCell>
                <TableCell align="right">
                  N/A
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
