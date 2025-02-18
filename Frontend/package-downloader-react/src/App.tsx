import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SearchForm from './components/SearchForm/SearchForm';
import SearchResults from './components/SearchForm/SearchResultsList';
import PackageCart from './components/Cart/PackageCart';
import { packagesSearchStore } from './stores/PackagesStore';
import RecommendationsModal from './components/Recommendations/RecommendationsModal';

const App: React.FC = () => {
  const { fondedPackages } = packagesSearchStore;
  return (

    <Container maxWidth="xl">
      <Typography variant="h4" align="center" gutterBottom>
        Package Downloader
      </Typography>

      <SearchForm />
      <PackageCart />
      <RecommendationsModal />
      
    </Container>

  );
};

export default App;
