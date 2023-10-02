import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Name } from '@ndn/packet'
import { ValidityPeriod } from '@ndn/keychain'

export class CertData {
  public readonly nameString
  public readonly validityString

  constructor(readonly name: Name, readonly validity: ValidityPeriod) {
    const formatDate = (date: Date) => {
      const year = date.getFullYear().toString().padStart(4, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = (date.getDay() + 1).toString().padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    this.nameString = this.name.toString()
    const start = new Date(this.validity.notBefore)
    const end = new Date(this.validity.notAfter)
    this.validityString = `${formatDate(start)} -- ${formatDate(end)}`
  }
}

export default function CertTable({ certs }: { certs: CertData[] }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Validity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {certs.map(cert => (
            <TableRow
              key={cert.nameString}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {cert.nameString}
              </TableCell>
              <TableCell align="right">{cert.validityString}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}