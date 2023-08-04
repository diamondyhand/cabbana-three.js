import { Helmet } from 'react-helmet-async';
import PageHeader from './PageHeader';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import { Container } from '@mui/material';
import Footer from 'src/components/Footer';
import Editor from "./3D-Editor/Editor";


function Dashboard() {

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      {/* <PageTitleWrapper> */}
        {/* <PageHeader /> */}

      {/* </PageTitleWrapper> */}
      <Container id={"cabbana-canvas-container"}  maxWidth="xl">
        <Editor/>
      </Container>
      <Footer />
    </>
  );
}

export default Dashboard;
