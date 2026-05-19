import PackagesDownloadPage from "./pages/PackagesDownloadPage";
import React from 'react';
import ChunkedDownloadPlaywrightPage from "./testing/ChunkedDownloadPlaywrightPage";



const App: React.FC = () => {
  if (window.location.pathname === "/__playwright__/chunked-download") {
    return <ChunkedDownloadPlaywrightPage />;
  }

  return (
    <>
      <PackagesDownloadPage />
    </>
  );
};

export default App;
