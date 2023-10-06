import { Breadcrumbs, Link, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'

export default function PathBread({ rootPath, pathNames }: {
  rootPath: string,
  pathNames: string[]
}) {
  const paths = [rootPath, ...pathNames]

  return (
    <Breadcrumbs>
      {paths.map((value, index) => {
        const isFirst = index === 0
        const isLast = index === paths.length - 1
        const to = `${paths.slice(0, index + 1).join('/')}`

        return isLast ? (
          <Typography
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
            key={to}>
            {isFirst
              ? (<><HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> ROOT</>)
            : value}
          </Typography>
        ) : (
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center' }}
            color="inherit"
            key={to}
            component={RouterLink}
            to={to}>
            {isFirst
              ? (<><HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> ROOT</>)
            : value}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}
