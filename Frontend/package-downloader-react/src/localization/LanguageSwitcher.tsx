// src/components/LanguageSwitcher.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';
import CountryFlag from 'react-country-flag';

const languages = [
  { code: 'en', label: 'English', countryCode: 'GB' },
  { code: 'ru', label: 'Русский', countryCode: 'RU' },
];

const FlagAvatar = styled(Avatar)(({ theme }) => ({
  cursor: 'pointer',
  width: 32,
  height: 32,
  border: `1px solid ${theme.palette.grey[300]}`,
}));

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  const getCountryCode = (language: string) => 
    languages.find( l => l.code === language.toLocaleLowerCase() )?.countryCode

  return (
    <div>
      <FlagAvatar onClick={handleOpen}>
        <CountryFlag 
          countryCode={getCountryCode(i18n.language) ?? "GB"} 
          svg 
          style={{ width: '24px', height: '24px' }} 
        />
      </FlagAvatar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => handleLanguageChange(lang.code)}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ListItemIcon>
              <CountryFlag 
                countryCode={lang.countryCode} 
                svg 
                style={{ width: '24px', height: '24px' }} 
              />
            </ListItemIcon>
            <ListItemText primary={lang.label} sx={{ marginLeft: 1 }} />
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSwitcher;