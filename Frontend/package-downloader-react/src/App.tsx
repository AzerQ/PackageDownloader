import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import SearchForm from './components/SearchForm';
import SearchResultsList from './components/SearchResultsList';
import PackageCart from './components/PackageCart';
import DownloadButton from './components/DownloadButton';
import { packageApiClient, PackageInfo, PackageType } from './services/apiClient';

const App: React.FC = () => {
  const [searchResults, setSearchResults] = useState<PackageInfo[]>([]);
  const [cart, setCart] = useState<string[]>([]);

  const handleSearch = async (packageType: string, query: string) => {
    // TODO: Add API call here to fetch search results
    const packageTypeEnumValue = PackageType[packageType as keyof typeof PackageType];
    const searchResults = await packageApiClient.getSearchResults(packageTypeEnumValue, query);
    setSearchResults(searchResults);
  };

  const handleAddToCart = (packageName: string) => {
    if (cart.some(element => element === packageName))
      return;
    setCart((prevCart) => [...prevCart, packageName]);
  };

  const handleRemoveFromCart = (packageName: string) => {
    setCart((prevCart) => prevCart.filter((item) => item !== packageName));
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    alert('Downloading packages: ' + cart.join(', '));
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Package Manager
      </Typography>

      <SearchForm onSearch={handleSearch} />

      <Typography variant="h6" gutterBottom>
        Search Results
      </Typography>
      <SearchResultsList results={searchResults} onAddToCart={handleAddToCart} />

      <Typography variant="h6" gutterBottom>
        Selected Packages
      </Typography>
      <PackageCart cartItems={cart} onRemoveFromCart={handleRemoveFromCart} />

      <DownloadButton onDownload={handleDownload} />
    </Container>
  );
};

export default App;
