import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResultsList';
import PackageCart from './components/PackageCart';
import DownloadButton from './components/DownloadButton';
import { packagesSearchStore } from './stores/PackagesStore';

const App: React.FC = () => {
  const {fondedPackages} = packagesSearchStore;
  return (

    <Container maxWidth="xl">
      <Typography variant="h4" align="center" gutterBottom>
        Package Manager
      </Typography>

      <SearchForm />

      <Box
        sx={{
          position: 'fixed',
          bottom: 0, // Зафиксировать внизу
          right: 0,  // Зафиксировать вправо
          width: '300px', // Ширина корзины
          zIndex: 1000, // Обеспечивает, что корзина выше других элементов
          backgroundColor: 'white', // Цвет фона, чтобы выделить элемент
          boxShadow: 3, // Добавить тень для эффекта
          padding: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Selected Packages
        </Typography>
        <PackageCart />
        <DownloadButton />
      </Box>

      <Typography variant="h6" gutterBottom>
        Search Results
      </Typography>

      <SearchResults/>

    </Container>

  );
};

export default App;
