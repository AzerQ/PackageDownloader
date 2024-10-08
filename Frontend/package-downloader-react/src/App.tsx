import React, { useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResultsList';
import PackageCart from './components/PackageCart';
import DownloadButton from './components/DownloadButton';
import { packageApiClient, PackageDetails, PackageInfo, PackageType } from './services/apiClient';

const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<PackageInfo[]>([]);
  const [cart, setCart] = useState<PackageDetails[]>([]);

  const handleSearch = async (packageType: string, query: string) => {
    // TODO: Add API call here to fetch search results
    const packageTypeEnumValue = PackageType[packageType as keyof typeof PackageType];
    const searchResults = await packageApiClient.getSearchResults(packageTypeEnumValue, query);
    setSearchResults(searchResults);
  };

  const handleAddToCart = (packageItem: PackageDetails) => {
    if (cart.some(element => element.equals(packageItem)))
      return;
    setCart((prevCart) => [...prevCart, packageItem]);
  };

  const handleRemoveFromCart = (packageItem: PackageDetails) => {
    setCart((prevCart) => prevCart.filter((item) => !item.equals(packageItem)));
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    alert('Downloading packages: ' + cart.join(', '));
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" align="center" gutterBottom>
        Package Manager
      </Typography>

      <SearchForm onSearch={handleSearch} />

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
        <PackageCart cartItems={cart} onRemoveFromCart={handleRemoveFromCart} />
        <DownloadButton onDownload={handleDownload} />
      </Box>

      <Typography variant="h6" gutterBottom>
        Search Results
      </Typography>
      <SearchResults results={searchResults} onAddToCart={handleAddToCart} />

    </Container>
  );
};

export default App;
