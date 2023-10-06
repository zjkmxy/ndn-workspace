import { AppBar, Button, IconButton, Toolbar } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import PathBread from './path-bread'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import { useState } from "react"

export default function AppTools({ rootPath, pathNames, menuItems, onCompile }: {
  rootPath: string,
  pathNames: string[],
  menuItems: Array<{ name: string, onClick?: () => void, icon?: JSX.Element }>,
  onCompile: () => void
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = menuAnchor !== null

  const closeMenu = () => setMenuAnchor(null)
  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  return (
    <AppBar position="sticky" color="transparent" sx={{ boxShadow: 'none' }}>
      <Toolbar key='toolbar'>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={openMenu}
        >
          <MenuIcon />
        </IconButton>
        <div style={{ flexGrow: 1 }}>
          <PathBread rootPath={rootPath} pathNames={pathNames} />
        </div>
        <Button onClick={onCompile}>
          Compile
        </Button>
      </Toolbar>

      <Menu
        key='menu'
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={closeMenu}>
        {menuItems.map(({ name, onClick, icon }) => {
          if (name === 'divider') {
            return (<Divider sx={{ my: 0.5 }} />)
          } else {
            return (<MenuItem
              key={name}
              onClick={() => {
                closeMenu()
                onClick?.call(onClick)
              }} disableRipple>
              {icon}
              {name}
            </MenuItem>)
          }
        })}
      </Menu>
    </AppBar>
  )
}