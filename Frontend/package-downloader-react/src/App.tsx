import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import SearchForm from './components/SearchForm/SearchForm';
import SearchResults from './components/SearchForm/SearchResultsList';
import PackageCart from './components/Cart/PackageCart';
import DownloadPackagesButton from './components/Cart/DownloadButton';
import { packagesSearchStore } from './stores/PackagesStore';

const App: React.FC = () => {
  const {fondedPackages} = packagesSearchStore;
  return (

    <Container maxWidth="xl">
      <Typography variant="h4" align="center" gutterBottom>
        Package Manager
      </Typography>

      <SearchForm />
      <PackageCart/>

      <Typography variant="h6" gutterBottom>
        Search Results
      </Typography>

      <SearchResults/>

    </Container>

  );
};

export default App;
